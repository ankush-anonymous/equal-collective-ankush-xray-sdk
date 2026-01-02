-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- DROP TABLES (DEPENDENCY ORDER)
-- =====================================================
DROP TABLE IF EXISTS execution_errors;
DROP TABLE IF EXISTS execution_steps;
DROP TABLE IF EXISTS executions;
DROP TABLE IF EXISTS schema_definitions;

-- =====================================================
-- EXECUTIONS
-- =====================================================
CREATE TABLE executions (
  execution_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_name    VARCHAR NOT NULL,
  environment      VARCHAR NOT NULL,
  status           VARCHAR NOT NULL,
  trigger_type     VARCHAR NOT NULL,
  triggered_by     VARCHAR,
  started_at       TIMESTAMP NOT NULL DEFAULT now(),
  ended_at         TIMESTAMP,
  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

-- Indexes for executions
CREATE INDEX idx_executions_pipeline
  ON executions (pipeline_name);

CREATE INDEX idx_executions_status
  ON executions (status);

CREATE INDEX idx_executions_environment
  ON executions (environment);

CREATE INDEX idx_executions_running_started
ON executions (started_at)
WHERE status = 'running';

-- =====================================================
-- EXECUTION STEPS
-- =====================================================
CREATE TABLE execution_steps (
  execution_step_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id       UUID NOT NULL,
  step_index         INTEGER NOT NULL,
  step_name          VARCHAR NOT NULL,
  step_type          VARCHAR NOT NULL,
  input_payload      JSONB NOT NULL,
  output_payload     JSONB,
  reasoning_payload  JSONB,
  status             VARCHAR NOT NULL,
  error_message      TEXT,
  started_at         TIMESTAMP NOT NULL DEFAULT now(),
  ended_at           TIMESTAMP,

  FOREIGN KEY (execution_id)
    REFERENCES executions (execution_id)
    ON DELETE CASCADE,

  UNIQUE (execution_id, step_index)
);

-- Indexes for execution steps
CREATE INDEX idx_execution_steps_order
  ON execution_steps (execution_id, step_index);

CREATE INDEX idx_execution_steps_type
  ON execution_steps (step_type);

CREATE INDEX idx_execution_steps_reasoning_gin
  ON execution_steps USING GIN (reasoning_payload);

-- =====================================================
-- EXECUTION ERRORS
-- =====================================================
CREATE TABLE execution_errors (
  execution_error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id       UUID NOT NULL,
  execution_step_id  UUID,
  step_name          VARCHAR,
  step_type          VARCHAR,
  error_message      TEXT NOT NULL,
  stack_trace        TEXT,
  created_at         TIMESTAMP DEFAULT now(),

  FOREIGN KEY (execution_id)
    REFERENCES executions (execution_id)
    ON DELETE CASCADE,

  FOREIGN KEY (execution_step_id)
    REFERENCES execution_steps (execution_step_id)
    ON DELETE SET NULL
);


