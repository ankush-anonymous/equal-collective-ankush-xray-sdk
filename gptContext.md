# X-Ray API Documentation & Context

## Base URL
`http://localhost:5001/api/v1`

---

## 1. Executions
**Endpoint:** `/executions`

### Create Execution
- **URL:** `/createExecution`
- **Method:** `POST`
- **Body:**
```json
{
    "pipeline_name": "",
    "environment": "",
    "status": "",
    "trigger_type": "",
    "triggered_by": "",
    "started_at": ""
}
```

### Get All Executions
- **URL:** `/getAllExecution`
- **Method:** `GET`

### Get Execution By ID
- **URL:** `/getExecutionById/:id`
- **Method:** `GET`

### Delete Execution By ID
- **URL:** `/deleteExecutionById/:id`
- **Method:** `DELETE`

---

## 2. Execution Steps
**Endpoint:** `/execution-steps`

### Create Execution Step
- **URL:** `/createExecutionStep`
- **Method:** `POST`
- **Body:**
```json
{
    "execution_id": "",
    "step_index": 0,
    "step_name": "",
    "step_type": "",
    "input_payload": {},
    "output_payload": {},
    "reasoning_payload": {},
    "status": "",
    "error_message": "",
    "started_at": ""
}
```

### Get All Execution Steps
- **URL:** `/getAllExecutionStep`
- **Method:** `GET`

### Get Execution Step By ID
- **URL:** `/getExecutionStepById/:id`
- **Method:** `GET`

### Delete Execution Step By ID
- **URL:** `/deleteExecutionStepById/:id`
- **Method:** `DELETE`

---

## 3. Execution Errors
**Endpoint:** `/execution-errors`

### Create Execution Error
- **URL:** `/createExecutionError`
- **Method:** `POST`
- **Body:**
```json
{
    "execution_id": "",
    "execution_step_id": "",
    "step_name": "",
    "step_type": "",
    "error_message": "",
    "stack_trace": ""
}
```

### Get All Execution Errors
- **URL:** `/getAllExecutionError`
- **Method:** `GET`

### Get Execution Error By ID
- **URL:** `/getExecutionErrorById/:id`
- **Method:** `GET`

### Delete Execution Error By ID
- **URL:** `/deleteExecutionErrorById/:id`
- **Method:** `DELETE`