# Donor Management System

This document outlines the Entity-Relationship Diagram (ERD) for the database relating to the Donor Management System.

## Notes

- USER and DONOR: Optional one-to-one relationship (a USER may be a DONOR).

## Questions

- Should Donor Table combine with User?

## Constraints

## ERD Diagram

```mermaid
erDiagram
    direction LR
    USER |o--|| DONOR : may_be
    DONOR ||--o{ DONATION_TRANSACTION : donates
    DONOR ||--o{ RECURRING_DONATION : schedules
    RECURRING_DONATION ||--o{ DONATION_TRANSACTION : creates

    USER {
        uuid id PK
    }
    DONOR {
        uuid id PK
        uuid form_submission_id PK
    }
    RECURRING_DONATION {
        uuid id PK
        uuid donor_id FK
        uuid project_id FK
        string type "individual, fundraising, corporate etc."
        string payment_mode
        enum frequency "daily, weekly, biweekly, monthly"
        date start_date
        date next_date
        boolean is_active
        boolean is_auto_deducted "E.g. GIRO, Scheduled Transfers"
        string auto "OPTIONAL"

    }
    DONATION_TRANSACTION {
        uuid id PK
        uuid donor_id FK
        uuid project_id FK
        string type "individual, corporate, fundraising events"
        string payment_mode
        date date
        decimal amount
        uuid recurring_donation_id FK
        string receipt_number
        boolean is_thank_you_sent
    }
```
