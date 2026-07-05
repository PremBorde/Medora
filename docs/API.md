# API Reference — Medora AI

Base URL: `http://localhost:8080/api`

All responses follow the pattern:
```json
{ "success": true, "message": null, "data": { ... } }
```

---

## Authentication

### POST /auth/register
Create a new patient account.

**Request**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Response** `201 Created`
```json
{
  "token": "eyJhbGc...",
  "type": "Bearer",
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

---

### POST /auth/login
Authenticate an existing patient.

**Request**
```json
{ "email": "jane@example.com", "password": "securePassword123" }
```

**Response** `200 OK`
```json
{
  "token": "eyJhbGc...",
  "type": "Bearer",
  "email": "jane@example.com",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

---

## Patients

> All patient endpoints require `Authorization: Bearer <token>` header.

### GET /patients/me
Get authenticated patient's profile.

**Response** `200 OK`
```json
{
  "id": "uuid",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "dateOfBirth": "1990-05-15",
  "gender": "Female",
  "phoneNumber": "+1 555 000 0000",
  "allergies": "Penicillin",
  "chronicConditions": "Hypertension",
  "currentMedications": "Lisinopril 10mg",
  "bloodType": "A+",
  "heightCm": 165.0,
  "weightKg": 62.5
}
```

---

### PUT /patients/me
Update the authenticated patient's profile. All fields are optional.

**Request** (any subset of profile fields)
```json
{ "phoneNumber": "+1 555 111 2222", "bloodType": "A+" }
```

**Response** `200 OK` — Updated patient profile

---

## Symptoms

> Requires authentication.

### POST /symptoms/analyze
Perform an AI-powered symptom assessment.

**Request**
```json
{
  "symptoms": "I've had a severe headache on the right side for 3 days...",
  "age": 34,
  "gender": "Female",
  "knownConditions": ["Hypertension"],
  "currentMedications": ["Lisinopril 10mg"],
  "additionalContext": "No recent travel"
}
```

**Response** `200 OK`
```json
{
  "urgencyLevel": "MEDIUM",
  "confidence": 72,
  "reasoning": "Persistent unilateral headache lasting 3 days in a patient with hypertension warrants medical evaluation...",
  "specialistType": "Neurologist",
  "specialistReason": "Persistent one-sided headaches may require neurological evaluation to rule out migraine disorders...",
  "followUpQuestions": [
    "Is the pain throbbing or constant?",
    "Do you experience visual changes before the headache?",
    "Has your blood pressure been elevated recently?"
  ],
  "educationalSummary": "Unilateral headaches can be associated with several conditions including tension-type headaches...",
  "seekImmediateCare": false,
  "disclaimer": "This assessment is for educational purposes only and does not constitute medical advice..."
}
```

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Validation error — check `data` field for field-level errors |
| `401` | Unauthorized — missing or invalid JWT |
| `404` | Resource not found |
| `409` | Conflict — email already registered |
| `500` | Internal server error |

```json
{ "success": false, "message": "Email already registered", "data": null }
```
