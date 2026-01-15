# Partner Info Route Output Format

## Endpoint
`GET /api/v1/profile/:partnerId`

**Authentication**: Required (JWT token)

**URL Parameter**: `partnerId` (UUID) - The user ID of the partner

## Response Structure

The response contains 5 main sections:

### 1. personalParticulars
```json
{
  "fullName": "string",
  "prefixTitle": "string",
  "birthday": "string (DD/MM/YYYY format)",
  "gender": "male | female | others",
  "occupation": "string",
  "nationality": "string",
  "phoneNumber": "string (countryCode + contactNumber)",
  "preferredCommunicationMethod": "email | whatsapp | telegram | messenger | phoneCall"
}
```

### 2. projects (array)
Array of projects the partner has participated in, grouped by project ID.

Each project object:
```json
{
  "projectId": "uuid",
  "projectTitle": "string",
  "sessions": [
    {
      "sessionName": "string",
      "date": "ISO date string",
      "startTime": "ISO date string",
      "endTime": "ISO date string",
      "attendance": "Attended | Did not attend | Unknown",
      "hoursCompleted": "number (rounded to 2 decimals)"
    }
  ],
  "totalHours": "number (rounded to 2 decimals, sum of all session hours)"
}
```

**Notes:**
- Projects are grouped by project ID
- Sessions are aggregated per project
- Hours are calculated from session start/end times
- Hours only counted if `has_attended === true`
- Projects filtered to only include those with status 'approved' or 'active'

### 3. partnershipInterests (array)
Array of partnership interest categories with Yes/No indicators.

Each interest object:
```json
{
  "interest": "string (readable label)",
  "interested": "boolean"
}
```

**Available Interests:**
- "Organizing fundraising events"
- "Planning trips for your organization/group"
- "Short-term mission trips (up to 14 days)"
- "Long-term commitments (6 months or more)"
- "Behind-the-scenes administration"
- "Marketing & social media magic"
- "Teaching & mentoring"
- "Training & program development"
- "Agriculture projects"
- "Building & facilities work"
- "Other: [custom text]" (only included if `otherInterests` field is provided)

### 4. performance (array)
Array of performance reviews/peer feedback received by the partner.

Each performance review object:
```json
{
  "reviewerName": "string (firstName + lastName)",
  "timestamp": "ISO date string",
  "score": "number",
  "strengths": "string",
  "areasOfImprovement": "string",
  "projectTitle": "string",
  "feedbackType": "supervisor | peer | self",
  "tags": ["string"]
}
```

**Notes:**
- Ordered by creation date (most recent first)
- Only includes feedback where this partner is the reviewee
- Tags are extracted from associated FeedbackTag records

### 5. profile (object)
Raw partner profile data from `getPartnerProfile` function.

Contains all partner profile fields including:
- User fields: firstName, lastName, title, email
- Partner scalar fields: dob, countryCode, contactNumber, emergency contacts, identificationNumber, nationality, occupation, gender, residentialAddress, etc.
- Partner relations: skills (array), languages (array), contactModes (array), interests (array)

## Complete Example Response

```json
{
  "personalParticulars": {
    "fullName": "Alex Tan",
    "prefixTitle": "Mr",
    "birthday": "12/03/1998",
    "gender": "male",
    "occupation": "Marketing Executive",
    "nationality": "Singaporean",
    "phoneNumber": "+6591234567",
    "preferredCommunicationMethod": "email"
  },
  "projects": [
    {
      "projectId": "uuid-1",
      "projectTitle": "Food Distribution Drive",
      "sessions": [
        {
          "sessionName": "Session 1",
          "date": "2025-06-15T00:00:00.000Z",
          "startTime": "2025-06-15T09:00:00.000Z",
          "endTime": "2025-06-15T17:00:00.000Z",
          "attendance": "Attended",
          "hoursCompleted": 8
        }
      ],
      "totalHours": 8
    },
    {
      "projectId": "uuid-2",
      "projectTitle": "Community Children's Program",
      "sessions": [
        {
          "sessionName": "Session 1",
          "date": "2025-07-10T00:00:00.000Z",
          "startTime": "2025-07-10T09:00:00.000Z",
          "endTime": "2025-07-10T17:00:00.000Z",
          "attendance": "Did not attend",
          "hoursCompleted": 0
        }
      ],
      "totalHours": 0
    }
  ],
  "partnershipInterests": [
    {
      "interest": "Organizing fundraising events",
      "interested": true
    },
    {
      "interest": "Planning trips for your organization/group",
      "interested": true
    },
    {
      "interest": "Short-term mission trips (up to 14 days)",
      "interested": true
    },
    {
      "interest": "Long-term commitments (6 months or more)",
      "interested": false
    },
    {
      "interest": "Behind-the-scenes administration",
      "interested": true
    },
    {
      "interest": "Marketing & social media magic",
      "interested": true
    },
    {
      "interest": "Teaching & mentoring",
      "interested": false
    },
    {
      "interest": "Training & program development",
      "interested": false
    },
    {
      "interest": "Agriculture projects",
      "interested": true
    },
    {
      "interest": "Building & facilities work",
      "interested": true
    },
    {
      "interest": "Other",
      "interested": false
    }
  ],
  "performance": [
    {
      "reviewerName": "Jamie Lee",
      "timestamp": "2025-08-10T15:15:00.000Z",
      "score": 4.5,
      "strengths": "Reliable, Proactive, Time management",
      "areasOfImprovement": "Could improve communication",
      "projectTitle": "Food Distribution Drive",
      "feedbackType": "peer",
      "tags": ["reliable", "proactive"]
    },
    {
      "reviewerName": "Daniel Wong",
      "timestamp": "2025-08-22T11:40:00.000Z",
      "score": 4,
      "strengths": "Clear Communication, Documentation",
      "areasOfImprovement": "Time management",
      "projectTitle": "Community Children's Program",
      "feedbackType": "supervisor",
      "tags": ["communication"]
    }
  ],
  "profile": {
    "firstName": "Alex",
    "lastName": "Tan",
    "email": "alex@example.com",
    "title": "Mr",
    "dob": "1998-03-12T00:00:00.000Z",
    "countryCode": "+65",
    "contactNumber": "91234567",
    "nationality": "Singaporean",
    "occupation": "Marketing Executive",
    "gender": "male",
    "skills": ["marketing", "communication"],
    "languages": ["English", "Mandarin"],
    "contactModes": ["email"],
    "interests": ["fundraise", "planTrips", "missionTrips", "admin", "publicity", "agriculture", "building"],
    // ... other partner profile fields
  }
}
```

## Usage Example

```bash
curl -X GET http://localhost:3000/api/v1/profile/YOUR_PARTNER_USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

- All dates are returned as ISO 8601 date strings
- Hours are calculated from session start/end times and rounded to 2 decimal places
- Attendance status is determined from `has_attended` field: `true` = "Attended", `false` = "Did not attend", `null/undefined` = "Unknown"
- Projects only include sessions where the volunteer has a VolunteerSession record
- Performance reviews are ordered by creation date (most recent first)
- Partnership interests map enum slugs to human-readable labels

