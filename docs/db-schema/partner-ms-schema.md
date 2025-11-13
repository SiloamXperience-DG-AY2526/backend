# Partner Management System

This document outlines the Entity-Relationship Diagram (ERD) for general PMS.

## Notes

## ERD Diagram

```mermaid
erDiagram
    direction LR
    USER }o--o{ USER_ROLE : has
    ROLES }o--o{ USER_ROLE : assigned_to
    PERMISSIONS
    USER |o--|| PARTNER : is

    USER {
        uuid id PK
        timestamptz created_at
        string username
        string email
        string password_hash
    }
    ROLES {
        uuid id PK
        string roleName
        string description
        timestamptz created_at "DEFAULT CURRENT_TIMESTAMP"
    }
    USER_ROLE {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
    }
    PERMISSIONS {
        uuid id PK
        string name
        string description
    }
    ROLE_PERMISSIONS {
        uuid role_id FK
        uuid permissions_id FK
    }

    PARTNER {
        uuid id PK
        string form_details
        string indemnity_form
        string other_forms
    }
```
