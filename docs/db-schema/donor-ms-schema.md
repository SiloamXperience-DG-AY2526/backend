# Donor Management System

This document outlines the Entity-Relationship Diagram (ERD) for the database relating to the Donor Management System.

## Notes

## Questions

## Constraints

## ERD Diagram

```mermaid
erDiagram
    direction LR
    USER ||--o{ DONATION_TRANSACTION : donates
    USER ||--o{ RECURRING_DONATION : schedules
    RECURRING_DONATION ||--o{ DONATION_TRANSACTION : creates
    USER }o--|| DON_PROJECT: manages
    DON_PROJECT ||--o{ DON_PROJECT_OBJECTIVES: sets
    USER {
        uuid id PK
    }
    RECURRING_DONATION {
        uuid id PK
        uuid donor_id FK
        uuid project_id FK
        string type "individual, fundraising, corporate etc."
        string payment_mode
        decimal scheduled_amount
        enum frequency "daily, weekly, biweekly, monthly"
        timestamptz start_date
        timestamptz next_date
        boolean is_active
        boolean is_auto_deducted "E.g. GIRO, Scheduled Transfers"
        string status
    }
    DONATION_TRANSACTION {
        uuid id PK
        uuid donor_id FK
        uuid project_id FK
        enum type "individual, corporate, fundraising events - optional"

        string country_of_residence
        string payment_mode
        timestamptz date
        decimal amount
        uuid recurring_donation_id FK "optional"
        string receipt "optional"
        boolean is_thank_you_sent
        boolean is_admin_notified
        enum submission_status "draft, submitted, withdrawn"
        enum verification_status "pending, recieved, cancelled"
        string status
    }
    DON_PROJECT {
        uuid id PK
        uuid managedBy FK "user"
        string title
        string location
        string about
        string objectives
        string beneficiaries "optional"
        string initiator_name "optional"
        string organising_team "optional"

        decimal target_fund "optional"
        decimal brick_size "optional"
        timestamptz deadline "optional"
        enum type "brick, sponsor, partner_led"

        date start_date
        date end_date

        boolean submission_status "draft, submitted, withdrawn"
        enum approval_status "pending (submitted but not reviewed), reviewing, approved, rejected"
        string approval_notes
        string image "optional"
        string attachments "optional"
        timestamptz createdAt
        timestamptz updatedAt
    }
    DON_PROJECT_OBJECTIVES {
        uuid id PK
        uuid don_project_id FK
        string objective
        int order "unique with vol_project_id"
        timestamptz createdAt
        timestamptz updatedAt
    }


```
