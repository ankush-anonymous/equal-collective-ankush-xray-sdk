# X-Ray System Architecture

![Overall Architecture](overall%20architecture.png)

![DB Architecture](DB%20architecture.png)

## 1. Core Design & Data Model Rationale

### Data Model

- **Schema:** Relational structure with `executions`, `execution_steps`, and `execution_errors`. (See `schema.sql` in repo).
- **Fields:** Core metadata is stored in typed columns; varied payloads (input, output, reasoning) use `JSONB`.

### Storage Choice

- **Technology:** PostgreSQL (relational) with `JSONB` support.
- **Why:** Structured, query-intensive, and highly relational (`execution` → `steps` → `reasoning`). SQL fits the system’s primary goal—debugging and analysis—rather than raw, unstructured event ingestion.

### Why We Chose SQL Over NoSQL

1.  **Strong Queryability:** Essential for debugging multi-step AI pipelines. Enables precise filters like:
    - _“Steps where >90% of candidates were eliminated”_
    - _“All ranking steps with confidence < 0.4”_
2.  **Schema Enforcement:** A consistent, enforced schema ensures logs are uniform across different pipelines.
3.  **Natural Relationships:** Relational modeling naturally connects `runs` → `steps` → `reasoning` → `errors`.
4.  **Analytical Power:** Supports indexes, joins, and aggregations, which are core to X-Ray use cases.
5.  **Data Integrity:** Typed fields and constraints prevent malformed or inconsistent logs.

**NoSQL’s schema flexibility risks:**

- Inconsistent logging formats across different teams.
- Harder cross-pipeline analysis.
- Weaker relational querying, making debugging workflows significantly harder.

### Alternatives Considered

1.  **JSON files / log blobs:**
    - _Pros:_ Simple to write.
    - _Cons:_ Extremely difficult to query, index, or correlate across runs.
2.  **Pure NoSQL (e.g., MongoDB):**
    - _Pros:_ Flexible schema.
    - _Cons:_ Poor enforcement and weaker joins; higher risk of divergent log structures.

**Decision:** We rejected both in favor of predictable, query-friendly relational storage.

### Trade-Offs We Accepted

- **Schema Rigidity:** SQL is less flexible for rapidly evolving fields and requires migrations.
- **Structure:** Not ideal for deeply nested or highly dynamic data structures.
- **Performance:** Write-heavy workloads may require batching or tuning compared to specialized ingest engines.
- **Scaling:** Horizontal scaling of relational databases is more complex than NoSQL systems.

### Why These Trade-Offs Are Acceptable

- **Priority:** X-Ray prioritizes reliable debugging and analytics over raw, unstructured log volume.
- **Predictability:** Query power and predictability matter more than infinite schema flexibility.
- **Alignment:** The model aligns directly with the system’s core purpose: making AI decisions explainable and debuggable.

---

## 2. Debugging Walkthrough: The "Phone Case" Incident

**Scenario:** A user searches for a "Laptop Stand," but the pipeline returns a "Phone Case."

**Investigation Flow:**

1.  **Find the Run:** Query `/executions` filtering by `pipeline_name='competitor_selection'` and `status='completed'` near the error timestamp.
2.  **Inspect Steps:** Retrieve all steps for that specific `execution_id` via `/execution-steps`.
3.  **Trace the Logic:**
    - **Step 1 (Search):** Confirm input "Laptop Stand" returned 50 valid candidates.
    - **Step 2 (Filter - LLM):** Observe output dropped from 50 to 5.
4.  **Identify Root Cause:** Expand the `reasoning_payload` for the LLM step.
    - _Observation:_ LLM reasoning says: _"Excluded item 'MacBook Stand' because it contains 'Apple' keyword."_
    - _Insight:_ The LLM hallucinated a constraint. The developer sees _why_ it happened, not just _that_ it happened.

---

## 3. Queryability Across Varied Pipelines

### Core Problem We Designed For

- X-Ray supports multiple heterogeneous pipelines (competitor discovery, listing optimization, categorization, etc.).
- Despite different business logic, users must ask cross-cutting questions, such as: _“Show all runs where filtering eliminated >90% of candidates”_.

### How the Data Model Enables This

- Execution steps are first-class entities, not embedded blobs.
- Every step is stored with: `step_name`, `step_type`, and structured `input_payload`, `output_payload`, `reasoning_payload`.
- Steps are queryable independently of the pipeline they belong to.
- This allows queries like:
  - _“All steps of type filter”_
  - _“All steps with percentage_eliminated > 90”_
- JSONB fields enable flexible but structured querying without losing schema guarantees.

### Cross-Pipeline Query Example

To answer: _“Show me all runs where filtering eliminated more than 90% of candidates”_, the system queries `execution_steps` filtered by:

- `step_type = 'filter'`
- `reasoning_payload.percentage_eliminated > 90`

**Why this works:**

- Filtering steps across pipelines share the same semantic meaning.
- Key metrics live in standardized reasoning fields.

### Constraints Imposed on Developers (By Design)

To make this possible, X-Ray enforces lightweight conventions:

- **Semantic step types:** `llm`, `api`, `filter`, `ranking`, `analysis`.
- **Meaningful step names:** e.g., `filter_candidates`, not `step_3`.
- **Schema-backed payloads:** Each step declares which fields it logs.
- **Key metrics must be logged in reasoning_payload:** e.g., `percentage_eliminated`, `confidence`, `score`.

These constraints trade some flexibility for strong, reliable queryability.

### Handling Variability Across Pipelines

- Different pipelines may filter different entities or use different heuristics.
- X-Ray does not enforce identical logic; it enforces consistent semantics.
- If a step is a “filter”, it must expose how much was filtered.
- Pipelines can add pipeline-specific fields, but shared concepts remain queryable.

### Why This Scales Beyond Given Use Cases

This design supports:

- Performance anomaly detection
- Model confidence analysis
- Drift analysis across runs
- Failure pattern clustering
- Pipeline comparison and audits

Because queries operate on **decisions**, not raw data, and **structured reasoning**, not generic logs, X-Ray remains useful even as pipelines change and new use cases emerge.

---

## 4. Performance & Scale

X-Ray does not log full per-item details for large intermediate datasets (e.g. all 5,000 candidates).

Instead, it logs outline-level information:

- Step name and step index
- Summarized input counts
- Summarized output counts
- Decision reasoning (why data was filtered or reduced)

For high-volume steps (like filtering):

- `input_payload` captures what came in (e.g. total candidates)
- `output_payload` captures what went out (e.g. remaining candidates)
- `reasoning_payload` explains why the reduction happened (rules applied, percentages eliminated)

This design makes it clear:

- Which step caused major data churn
- How aggressive the reduction was
- What logic or rule was responsible

### Trade-Offs

**Completeness**

- Full item-level capture provides maximum detail.
- But is rarely required to understand where or why a decision went wrong.

**Performance**

- Logging summaries avoids large payloads and serialization overhead.
- Keeps observability off the critical execution path.

**Storage Cost**

- Storing counts and reasoning scales predictably.
- Avoids unbounded growth from raw data dumps.

### Who Decides What Gets Captured?

The developer decides, not the system. X-Ray provides structure, conventions, and schema validation.

Developers choose whether to:

- Log only summaries (default).
- Log top-N examples.
- Log full details selectively (e.g. failures, low confidence cases).

### Key Principle

X-Ray focuses on **decision traceability**, not data exhaust. The goal is to explain what happened and why, without logging _everything_ that happened.

---

## 5. Developer Experience

### Instrumenting an Existing Pipeline

Developers do not change business logic. They only:

1. Define a schema for the pipeline.
2. Add a few SDK calls around existing steps.

The pipeline remains fully readable and executable without X-Ray.

### Step 1: Define a Pipeline Schema (Required)

For each pipeline, developers create one schema file. The schema declares:

- Pipeline name
- Step names
- Step types
- Allowed input, output, and reasoning keys

Only keys defined in the schema are allowed during logging. This enforces consistency, queryability, and predictable debugging.

**Example (competitor discovery schema):**

```javascript
module.exports = {
  pipeline: "competitor_discovery",
  steps: {
    generate_keywords: {
      type: "llm",
      input: { title: "", attributes: "" },
      output: { keywords: "" },
      reasoning: { confidence: "" },
    },
    filter_candidates: {
      type: "filter",
      input: { total_candidates: "" },
      output: { remaining_candidates: "" },
      reasoning: { percentage_eliminated: "" },
    },
  },
};
```

- One-line descriptions make schemas developer-friendly.
- Structured schemas make cross-pipeline queries possible.

### Step 2: Minimal Instrumentation (Useful Immediately)

Minimum changes required:

1. Import the SDK.
2. Start execution.
3. Log key steps.
4. End execution.

```javascript
const xray = require("../sdk/xRayClient");
```

Even with minimal logging, developers get an execution trace, step ordering, and basic debugging capability.

### SDK Usage in Practice

| Method                                  | Description                                                                                |
| :-------------------------------------- | :----------------------------------------------------------------------------------------- |
| `await xray.startExecution({...});`     | Starts a new execution run. Registers pipeline name, environment, and trigger metadata.    |
| `await xray.logStep({...});`            | Logs a single decision step. Enforces schema validation. Captures what happened and why.   |
| `await xray.logError({...});`           | Records execution-level or step-level failures. Ensures partial runs are still debuggable. |
| `await xray.endExecution(executionId);` | Marks execution as completed. Finalizes the run lifecycle.                                 |

### Error Handling & Backend Availability

X-Ray is non-blocking by design. If the backend is unavailable:

- Logging failures do not break the pipeline.
- Business logic continues to execute.

X-Ray is diagnostic, not critical-path.

---

## 7. Future Technical Roadmap
1.  **Async Ingestion:** Implement a message queue (e.g., Redis Streams or SQS) to decouple log ingestion from DB writes.
2.  **SDK Batching:** Buffer logs in the SDK and send them in intervals to minimize HTTP overhead.
3.  **Retention Policies:** Implement TTL (Time-To-Live) for debug data, automatically archiving or deleting old steps.
4.  **Visual Debugger:** A dashboard to visualize execution timelines (Gantt charts) and step-by-step logic flows.

---

## 8. What Next?

If this SDK were shipped for real-world use, the next technical improvements would focus on latency, deployability, and developer ergonomics.

### Local-first storage
*   Use a lightweight embedded relational database (e.g., SQLite-compatible) bundled with the SDK.
*   This allows zero-config setup and immediate usage without external infrastructure.
*   For larger teams or shared environments, the same storage layer could be deployed via Docker with minimal changes.

### Replace HTTP with in-process calls
*   Replace HTTP-based APIs with direct function calls within the SDK.
*   This would significantly reduce latency and remove network overhead.
*   Makes X-Ray suitable for high-throughput or low-latency pipelines.

### Pluggable persistence layer
Allow developers to switch between:
*   Local embedded DB
*   Remote Postgres
