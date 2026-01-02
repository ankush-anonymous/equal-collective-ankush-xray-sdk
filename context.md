# Project Approach: X-Ray SDK and Backend for Decision Debugging

## Problem Context
We are building an X-Ray system to capture and analyze decision-making inside multi-step pipelines. These pipelines may include a mix of deterministic logic (filters, rules, APIs) and probabilistic logic (LLMs, ranking heuristics). The system is designed to make each step of the pipeline observable, reconstructable, and queryable after execution.

## High-Level Approach
The system is split into two parts:

### X-Ray SDK
A lightweight client-side library embedded inside application code to record pipeline execution details.

### X-Ray Backend API
A centralized service that ingests structured logs, stores them, and exposes query endpoints for analysis.

The SDK focuses only on capturing and sending data, while the backend handles storage, state management, and querying.

## Decision Capture Model
### Step-Oriented Logging
Each pipeline execution is treated as a run, composed of multiple steps.
Every step captures:
- Step name
- Step type (e.g., llm, api, filter, ranking)
- Input data
- Output data
- Reasoning (structured metadata)
- Timestamp
- Status (success or error)

The `step_type` field is used as a categorical marker to classify the nature of the operation. This allows downstream systems to group, filter, and analyze steps based on how decisions were made, without embedding any domain-specific logic into the SDK.

## Structured Logging via Schema Configuration
### SDK-Level Schema Definition
Before logging begins, the SDK accepts a schema configuration that defines:
- Allowed `step_type` values
- Allowed keys inside `input_data`
- Allowed keys inside `output_data`
- Allowed keys inside `reasoning`

This schema is enforced inside the SDK before logs are sent to the backend. Any payload that does not match the schema can be warned, rejected, or sanitized.

### Backend Schema Persistence
The schema (or schema version) is optionally sent to the backend and stored alongside runs. This allows the backend to understand:
- Which structure was used for a given run
- How schemas evolve over time
- Why older runs may have different fields

The schema itself is treated as data, not code.

## Backend-Centric Storage and Querying Model
### Ingest Pattern
The SDK never writes to a database directly. All data flows as:
`SDK → HTTP (JSON payloads) → Backend API → Database`

The backend is responsible for:
- Persisting runs and steps
- Updating run lifecycle state
- Enforcing consistency at the database level
- Serving query requests

This keeps the SDK stateless and easy to integrate.

## Data Storage Strategy (Implementation-Oriented)
### Core Relational Structure
Data is modeled using a relational structure with three primary entities:
- **runs**: represents a single pipeline execution
- **steps**: represents individual decisions within a run
- **schemas**: represents the logging structure used

**Relationships:**
- run → many steps
- run → one schema version

### Semi-Structured Fields Using JSONB
While the overall structure is relational, certain fields are stored as JSONB:
- `input_data`
- `output_data`
- `reasoning`
- `schema_definition`

This approach allows:
- Consistent relational querying on run and step metadata
- Flexible storage of varying step-specific attributes
- Indexing of specific JSON keys when needed (e.g., `percentage_eliminated`)

Structured fields (IDs, timestamps, `step_type`, status) remain strongly typed, while decision context lives in JSONB.

### Run Lifecycle Management
Each run progresses through explicit lifecycle states:
- `running`: after `startRun`
- `completed`: after `endRun`
- `crashed`: after `logError`
- `incomplete`: inferred if no terminal event is received within a timeout window

This lifecycle is derived purely from events received by the backend, not from assumptions in the SDK.

## Query and Analysis Model
Because steps are stored with:
- timestamps
- `step_type`
- structured reasoning
- run-level state

The backend can support queries such as:
- filtering runs by status
- filtering steps by type
- threshold-based reasoning queries
- time-based performance analysis
- failure attribution by step category

All querying is performed at the backend using SQL + JSONB operators.

## Development Execution Approach
The system is built incrementally:
1. Initialize relational schema and JSONB columns
2. Implement backend ingest endpoints
3. Implement minimal SDK lifecycle functions
4. Add schema validation at SDK and backend
5. Handle crash and incomplete run detection
6. Implement query APIs
7. Validate with simulated pipelines

Each phase builds directly on persisted data and observable behavior.

## Outcome
The final system provides a decision-centric view of pipeline execution. Instead of treating pipelines as black boxes, each step becomes inspectable, comparable, and analyzable across runs. The architecture is intentionally minimal, general-purpose, and extensible without embedding domain assumptions.
