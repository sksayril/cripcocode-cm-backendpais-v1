# Employee API - Valid Enum Values

This document lists all valid enum values for the Employee creation API endpoint.

## API Endpoint
```
POST http://localhost:3500/api/employee/create
```

## Required Fields with Enum Values

### 1. Role (Required)
The `role` field must be one of the following values:

- `employee` - General employee role
- `junior` - Junior level position
- `senior` - Senior level position
- `lead` - Lead/Team lead position
- `manager` - Manager position
- `director` - Director position
- `designer` - Designer role
- `developer` - Developer role
- `analyst` - Analyst role
- `specialist` - Specialist role
- `coordinator` - Coordinator role
- `assistant` - Assistant role
- `consultant` - Consultant role
- `other` - Other role type

### 2. Department (Required)
The `department` field must be one of the following values:

- `development` - Development/Software Development
- `digital-marketing` - Digital Marketing
- `graphics-design` - Graphics Design
- `hr` - Human Resources
- `accounting` - Accounting
- `sales` - Sales
- `support` - Support/Customer Support
- `management` - Management
- `design` - Design
- `engineering` - Engineering
- `it` - Information Technology
- `marketing` - Marketing
- `operations` - Operations
- `finance` - Finance
- `legal` - Legal
- `research` - Research
- `other` - Other department

## Example Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "company": "COMPANY_ID_HERE",
  "department": "development",
  "role": "employee",
  "designation": "Software Developer",
  "joiningDate": "2024-01-15"
}
```

## Complete List Format

### Role Enum Values (14 options):
```
employee, junior, senior, lead, manager, director, designer, developer, analyst, specialist, coordinator, assistant, consultant, other
```

### Department Enum Values (17 options):
```
development, digital-marketing, graphics-design, hr, accounting, sales, support, management, design, engineering, it, marketing, operations, finance, legal, research, other
```

## Notes

- All enum values are **case-sensitive** - use lowercase exactly as shown
- Both `role` and `department` fields are **required**
- If you need a value not in the list, use `other` as a fallback
- The `employee` role was added to support general employee assignments

