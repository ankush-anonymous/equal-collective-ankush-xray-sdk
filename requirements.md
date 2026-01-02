# Project Brief: X-Ray SDK & API for Non-Deterministic Pipelines

## 1. Executive Summary
**Goal:** Build a "Glass Box" debugging system (SDK + API) for multi-step, non-deterministic algorithmic processes.
**Context:** Modern software pipelines often involve chains of operations (LLM calls, API fetches, heuristic filters) where the final output is opaque. When a pipeline fails (e.g., selects the wrong product), traditional logging reveals *what* happened, but not *why* specific decisions were made at intermediate steps.
**Objective:** Create a system that provides transparency into these decision points, allowing developers to query, analyze, and debug the logic flow across disparate pipelines.

## 2. The Core Problem
In complex pipelines (e.g., RAG, Search, Recommendation Systems), errors often occur in the "middle":
*   **LLM Steps:** Non-deterministic generation (e.g., generating search keywords).
*   **Filtering Steps:** Heuristic or rule-based reduction of large datasets.
*   **Ranking Steps:** Scoring logic that promotes/demotes candidates.

**The "Black Box" Issue:**
If a pipeline starts with 5,000 candidates and ends with 1 bad result, we need to know:
*   Did the initial search miss the good candidates?
*   Did a filter incorrectly discard the best match?
*   Did the ranking model hallucinate?

## 3. Deliverables

### A. The X-Ray SDK (Library)
A general-purpose, language-agnostic (conceptually) wrapper that developers integrate into their existing code.
*   **Function:** Wraps pipeline steps to capture context: inputs, outputs, decision logic, and metadata.
*   **Design Goals:**
    *   **Minimal Intrusion:** Must be easy to add to existing functions.
    *   **Fail-Safe:** If the X-Ray backend is down, the main application pipeline **must** continue functioning without error.
    *   **Domain Agnostic:** Must work for e-commerce, content moderation, data categorization, etc.

### B. The X-Ray API (Backend)
The centralized service that receives and serves the debugging data.
*   **Ingest Endpoint:** High-throughput endpoint to receive serialized trace/decision data from the SDK.
*   **Query Endpoint:** Allows users to ask complex questions about pipeline behavior.

## 4. Key Architectural Challenges & Constraints

### 1. Queryability & Data Model
*   **Requirement:** The system must support queries across *different* types of pipelines.
*   **Example Query:** *"Show me all runs across ALL pipelines where a 'filtering' step removed >90% of the input candidates."*
*   **Challenge:** The data model must be flexible enough to handle varied step types (LLM, SQL, API) but structured enough to allow global aggregation and filtering.

### 2. Performance & Data Scale
*   **Requirement:** Handle massive intermediate data efficiently.
*   **Scenario:** A step takes 5,000 items -> filters to 30.
*   **Challenge:** Logging full details for 4,970 rejected items is expensive (bandwidth/storage). The system needs a strategy for **Summarization vs. Full Capture**.
    *   *Decision:* Who decides (System vs. Developer)? What are the trade-offs?

### 3. Developer Experience (DX)
*   **Requirement:** Integration must be frictionless.
*   **Questions to Answer:**
    *   What is the absolute minimum code a user needs to write?
    *   How does "full instrumentation" look compared to "lite instrumentation"?

## 5. Canonical Use Case: Amazon Competitor Selection
To validate the architecture, we use this primary scenario:
1.  **Input:** A seller's product (e.g., a Laptop Stand).
2.  **Step 1 (LLM):** Generate search keywords.
3.  **Step 4 (LLM):** Semantic relevance check (Returns 10 items).
4.  **Step 5 (Rank):** Select top 1 competitor.
5.  **Output:** A Phone Case (Wrong Match).

**Debug Goal:** The X-Ray system must allow a developer to trace this specific run and identify exactly which step (1-5) introduced the error.
