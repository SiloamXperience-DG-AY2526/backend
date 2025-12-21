# Volunteer Management System

This document outlines the Entity-Relationship Diagram (ERD) for the database relating to the Volunteer Management System.

## Notes

- USER and VOLUNTEER: Optional one-to-one relationship (a USER may be a VOLUNTEER).

- Volunteer Table: References a form submission in `form-schema`

## Questions

-

## Constraints

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
    USER ||--o{ COMMITTED_FUND : creates
    USER ||--o{ COMMITTED_FUND : approves
    COMMITTED_FUND }o--|| PROJECT : funds
    USER ||--o{ DISBURSEMENT : creates
    USER |o--o{ DISBURSEMENT : approves
    DISBURSEMENT }o--|| PROJECT : spent_by
    USER ||--o{ FEEDBACK : make
    USER ||--o{ FEEDBACK : receive
    FEEDBACK }o--|| PROJECT : after


    USER {
        uuid id PK
    }
    VOLUNTEER {
        uuid id PK
        uuid user_id FK
        uuid form_submission_id FK
        string status "pending, available, assigned, rejected"
        timestamptz createdAt
        timestamptz updatedAt
    }
    SESSION {
        uuid id PK
        uuid project_id FK
        date session_date
        string name
        timestamptz start_time
        timestamptz end_time
        timestamptz createdAt
        timestamptz updatedAt
    }
    VOLUNTEER_SESSION {
        uuid id PK
        uuid volunteer_id FK
        uuid session_id FK
        timestamptz approved_at
        uuid approved_by FK
        string rsvp
        boolean attendance
        timestamptz createdAt
        timestamptz updatedAt
    }
    VOLUNTEER_PROJECT {
        uuid id PK
        uuid volunteer_id FK
        uuid project_id FK
        timestamptz approved_at
        uuid approved_by FK
        string approval_notes
        timestamptz createdAt
        timestamptz updatedAt
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
        timestamptz createdAt
        timestamptz updatedAt
    }
    COMMITTED_FUND {
        uuid id PK
        decimal amount
        uuid project_id FK
        string description
        int fiscal_year
        string status
        uuid created_by FK
        uuid approved_by FK
        timestamptz approved_at
        timestamptz createdAt
        timestamptz updatedAt
    }
    DISBURSEMENT {
        uuid id PK
        decimal amount
        uuid project_id FK
        string description
        int fiscal_year
        uuid created_by FK
        uuid approved_by FK
        timestamptz approved_at
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz disbursedAt
    }
    FEEDBACK {
        uuid id PK
        uuid from_user FK
        uuid to_user FK
        uuid project_id FK
        string feedback
        timestamptz createdAt
        timestamptz updatedAt
    }
```
