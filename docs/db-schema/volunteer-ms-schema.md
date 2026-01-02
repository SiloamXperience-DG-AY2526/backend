# Volunteer Management System

This document outlines the Entity-Relationship Diagram (ERD) for the database relating to the Volunteer Management System.

## Notes

## Questions

## Constraints

## ERD Diagram

```mermaid
erDiagram
    direction LR
    USER }o--o{ VOLUNTEER_SESSION : participates_in
    SESSION }o--o{ VOLUNTEER_SESSION : has_participants
    USER ||--o{ VOLUNTEER_PROJECT_POS : volunteers_for
    PROJ_POSITION ||--|{ VOLUNTEER_PROJECT_POS : is_signed_up_by
    USER |o--o{ VOLUNTEER_PROJECT_POS : approves
    USER |o--o{ VOL_PROJECT: approves
    USER ||--o{ VOL_PROJECT: manages
    VOL_PROJECT ||--o{ SESSION : organises
    VOL_PROJECT ||--o{ VOL_OBJECTIVE: sets
    VOL_PROJECT ||--o{ PROJ_POSITION: has
    PROJ_POSITION ||--o{ PROJ_SKILL: requires
    VOLUNTEER_PROJECT_POS ||--o| PROJ_FEEDBACK: submits
    USER ||--o{ PEER_FEEDBACK : submits
    USER ||--o{ PEER_FEEDBACK : receives
    PEER_FEEDBACK }o--|| VOL_PROJECT : after
    PEER_FEEDBACK }o--o{ FEEDBACK_TAG: selects
    FEEDBACK_TAG }o--|| TAG: one_of

    USER {
        uuid id PK
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
        string has_rsvp
        boolean has_attended
        timestamptz createdAt
        timestamptz updatedAt
    }
    VOLUNTEER_PROJECT_POS {
        uuid id PK
        uuid volunteer_id FK "user"
        uuid project_pos FK "proj_pos"
        string availability
        uuid project_feedback FK "vol_feedback"
        enum status "reviewing, approved, rejected, active, inactive"
        timestamptz approved_at "optional"
        uuid approved_by FK "optional"
        string approval_notes "for approver's use"
        string approval_message "message for volunteer"
        boolean has_consented
        timestamptz createdAt
        timestamptz updatedAt
    }
    VOL_PROJECT {
        uuid id PK
        uuid managedBy FK "user"
        string title
        string location
        string about_desc
        string objectives
        string beneficiaries
        string initiator_name "optional"
        string organising_team "optional"

        string proposed_plan "optional"

        time start_time
        time end_time
        date start_date
        date end_date
        enum frequency "once, daily, weekly, monthly, yearly"
        int interval "e.g. 2 -> every 2 weeks"
        string day_of_week "e.g. 0111000 means tue,wed,thur"

        boolean submission_status "draft, submitted, withdrawn"
        enum approval_status "pending (submitted but not reviewed), reviewing, approved, rejected"
        enum operation_status "ongoing, paused, cancelled, completed"
        string approval_notes "for approver's use"
        string approval_message "message for volunteer"
        string image "optional"
        string attachments "optional"
        timestamptz createdAt
        timestamptz updatedAt
    }
    VOL_OBJECTIVE {
        uuid id PK
        uuid vol_project_id FK
        string objective
        int order "unique with vol_project_id"
        timestamptz createdAt
        timestamptz updatedAt
    }
    PROJ_POSITION {
        uuid id PK
        uuid project_id FK
        int role
        int description
        int total_slots "at least 1"
        timestamptz createdAt
        timestamptz updatedAt
    }
    PROJ_SKILL {
        uuid id PK
        uuid project_pos_id FK
        string skill
        int order
        timestamptz createdAt
        timestamptz updatedAt
    }
    PROJ_FEEDBACK {
        uuid id PK
        uuid project_id FK
        int overall_rating
        int management_rating
        int planning_rating
        int resources_rating
        string enjoy_most
        string improvements
        string other_comments "optional"
        timestamptz createdAt
        timestamptz updatedAt
    }
    PEER_FEEDBACK {
        uuid id PK
        uuid reviewer FK
        uuid reviewee FK
        uuid project_id FK
        int score
        string type "supervisor, peer, self"
        string strengths
        string improvements
        timestamptz createdAt
        timestamptz updatedAt
    }
    FEEDBACK_TAG {
        uuid id PK
        uuid feedbackId FK
        uuid tagId FK
    }
    TAG {
        uuid id PK
        string name "unique"
        string slug "unique"
        string color "optional"
        boolean is_active "default true"
        timestamptz createdAt
    }

```
