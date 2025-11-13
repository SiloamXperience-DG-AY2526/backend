# Volunteer Management System

This document outlines the Entity-Relationship Diagram (ERD) for the database relating to the Volunteer Management System.

## Notes

- USER and VOLUNTEER: Optional one-to-one relationship (a USER may be a VOLUNTEER).

- Volunteer Table: References a form submission in `form-schema`

## Questions

- Should Volunteer Table combine with User?

## Constraints

- Trigger to manage only one volunteer profile per user
- Trigger to manage user approval of Volunteer_Project by role access
- Trigger to manage Projects created
- Trigger to ensure disbursement is created only after someone approves
- Scheduled Job / Trigger for Data retention for donations/receipts >= 7 years (configurable) with purge/anonymisation logs

## ERD Diagram

```mermaid
erDiagram
    direction LR
    USER |o--|| VOLUNTEER : may_be
    VOLUNTEER }o--o{ VOLUNTEER_SESSION : participates_in
    SESSION }o--o{ VOLUNTEER_SESSION : has_participants
    VOLUNTEER ||--o{ VOLUNTEER_PROJECT : manages
    PROJECT ||--|{ VOLUNTEER_PROJECT : managed_by
    PROJECT ||--o{ SESSION : organises
    USER ||--|| VOLUNTEER_PROJECT : approves
    USER ||--o{ DISBURSEMENT : creates
    USER |o--o{ DISBURSEMENT : approves
    DISBURSEMENT }o--|| PROJECT : funds
    USER ||--o{ FEEDBACK : make
    USER ||--o{ FEEDBACK : receive
    FEEDBACK }o--|| PROJECT : after


    USER {
        uuid id PK
    }
    VOLUNTEER {
        uuid id PK
        uuid form_submission_id PK
        string form_details
        string status "pending, available, assigned, rejected"
    }
    SESSION {
        uuid id PK
        uuid project_id FK
        date session_date
        string name
        timestamptz start_time
        timestamptz end_time
    }
    VOLUNTEER_SESSION {
        uuid id PK
        uuid volunteer_id FK
        uuid session_id FK
        timestamptz approved_at
        uuid approved_by FK
        string rsvp
        boolean attendance
    }
    VOLUNTEER_PROJECT {
        uuid id PK
        uuid volunteer_id FK
        uuid project_id FK
        timestamptz approved_at
        uuid approved_by FK "GM or higher"
        string approval_notes
    }
    PROJECT {
        uuid id PK
        string title
        string description
        string time_period
        boolean is_recurring
        string frequency
        date start_date
        date next_date
        enum status "draft, pending, approved, rejected, finished"
        boolean has_volunteering
        boolean has_donations
    }
    DISBURSEMENT {
        uuid id PK
        decimal amount
        timestamptz disbursed_at
        uuid project_id FK
        string description
        uuid created_by FK
        uuid approved_by FK "approver cannot be the same as creator"
        timestamptz approved_at
    }
    FEEDBACK {
        uuid id PK
        uuid from_user FK
        uuid to_user FK
        uuid project_id FK
        string feedback
    }
```
