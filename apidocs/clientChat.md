# Client Chat System API Documentation

## Overview

The Client Chat System API provides a comprehensive bidirectional messaging platform that allows any user (Client, Admin, Employee, superAdmin) to communicate with any other user. This system supports real-time messaging, message management, and advanced features like message categorization, priority levels, and search functionality.

**Supported Users:**
- **Client** (use senderModel/recipientModel: "Client")
- **superAdmin** (use senderModel/recipientModel: "superAdmin")
- **CompanyAdmin** (use senderModel/recipientModel: "CompanyAdmin")
- **Admin** (use senderModel/recipientModel: "Admin") 
- **Employee** (all roles: junior, senior, lead, manager, etc. - use senderModel/recipientModel: "Employee")

## Base URL
```
http://localhost:3500/api/client-chat
```

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles and Permissions

### Client Roles
- **client**: Basic client access
- **premium-client**: Premium client with enhanced features
- **enterprise-client**: Enterprise client with full access

### Admin/Employee Roles
- **superAdmin**: Can chat with any user, edit/delete any message
- **admin**: Can chat with clients and employees, edit/delete their own messages
- **CompanyAdmin**: Can chat with clients and employees, edit/delete their own messages
- **employee** (junior, senior, lead, manager, director, designer, developer, analyst, specialist, coordinator, assistant, consultant, other): Can chat with clients and admins, edit/delete their own messages

## API Endpoints

### 1. Send Message
**POST** `/api/client-chat/messages`

Send a message between any users (Client, Admin, Employee).

**Request Body:**
```json
{
  "senderId": "68bfd49bf0bc7bc682c3cfac",
  "senderModel": "Client",
  "recipientId": "68a80c80441e8c55f05336b0",
  "recipientModel": "Employee",
  "content": "Hello, how are you?",
  "type": "text",
  "attachments": [],
  "priority": "normal",
  "category": "support"
}
```

**Field Descriptions:**
- `senderId`: ID of the user sending the message (required)
- `senderModel`: Model type of sender ("Client", "Admin", "Employee", "superAdmin", or "CompanyAdmin") (required)
- `recipientId`: ID of the recipient (required)
- `recipientModel`: Model type of recipient ("Admin", "Employee", "superAdmin", "CompanyAdmin", or "Client")
  - Use "superAdmin" for superAdmin users
  - Use "CompanyAdmin" for CompanyAdmin users
  - Use "Admin" for admin users
  - Use "Employee" for all employee roles (junior, senior, lead, manager, etc.)
  - Use "Client" for client users
- `content`: Message content (max 5000 characters) (required)
- `type`: Message type ("text", "image", "file", "link") - default: "text"
- `attachments`: Array of attachment objects
- `priority`: Message priority ("low", "normal", "high", "urgent") - default: "normal"
- `category`: Message category ("general", "support", "billing", "technical", "feature-request", "complaint", "other") - default: "general"

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Hello, I need help with my account",
    "type": "text",
    "attachments": [],
    "sender": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "model": "Client",
      "name": "John Client",
      "role": "premium-client"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "model": "Admin",
      "name": "Jane Admin",
      "role": "admin"
    },
    "status": "sent",
    "priority": "normal",
    "category": "support",
    "edited": {
      "isEdited": false,
      "editCount": 0
    },
    "deleted": {
      "isDeleted": false
    },
    "readBy": [],
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:00:00.000Z"
  }
}
```

### 2. Send Message to Client (SuperAdmin Only)
**POST** `/api/client-chat/messages/to-client`

Send a message from superAdmin to a client.

**Request Body:**
```json
{
  "clientId": "68bfd49bf0bc7bc682c3cfac",
  "content": "Hello! How can I help you today?",
  "type": "text",
  "priority": "normal",
  "category": "support"
}
```

**Field Descriptions:**
- `clientId`: ID of the client receiving the message (required)
- `content`: Message content (max 5000 characters) (required)
- `type`: Message type ("text", "image", "file", "link") - default: "text"
- `attachments`: Array of attachment objects
- `priority`: Message priority ("low", "normal", "high", "urgent") - default: "normal"
- `category`: Message category ("general", "support", "billing", "technical", "feature-request", "complaint", "other") - default: "general"

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Hello! How can I help you today?",
    "type": "text",
    "attachments": [],
    "sender": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "model": "Admin",
      "name": "Super Admin",
      "role": "superAdmin"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "model": "Client",
      "name": "John Client",
      "role": "premium-client"
    },
    "status": "sent",
    "priority": "normal",
    "category": "support",
    "edited": {
      "isEdited": false,
      "editCount": 0
    },
    "deleted": {
      "isDeleted": false
    },
    "readBy": [],
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:00:00.000Z"
  }
}
```

### 3. Get Conversation
**GET** `/api/client-chat/conversation/:recipientId`

Get conversation between client and a specific recipient.

**Path Parameters:**
- `recipientId`: ID of the recipient

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "Hello, I need help with my account",
        "type": "text",
        "sender": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "model": "Client",
          "name": "John Client",
          "role": "premium-client"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
        },
        "status": "read",
        "priority": "normal",
        "category": "support",
        "createdAt": "2023-07-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 50
    }
  }
}
```

### 4. Get Client Messages
**GET** `/api/client-chat/messages`

Get all messages sent by the authenticated client.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "Hello, I need help with my account",
        "type": "text",
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
        },
        "status": "read",
        "priority": "normal",
        "category": "support",
        "createdAt": "2023-07-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 50
    }
  }
}
```

### 5. Get Recipient Messages
**GET** `/api/client-chat/recipient-messages`

Get all messages sent to the authenticated admin/employee.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "Hello, I need help with my account",
        "type": "text",
        "sender": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "model": "Client",
          "name": "John Client",
          "role": "premium-client"
        },
        "status": "sent",
        "priority": "normal",
        "category": "support",
        "createdAt": "2023-07-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 50
    }
  }
}
```

### 6. Edit Message
**POST** `/api/client-chat/messages/:messageId/edit`

Edit a message (only own messages for regular users, any message for superAdmin).

**Path Parameters:**
- `messageId`: ID of the message to edit

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message edited successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Updated message content",
    "edited": {
      "isEdited": true,
      "editCount": 1,
      "lastEditedAt": "2023-07-20T10:10:00.000Z",
      "lastEditedBy": "60f7b3b3b3b3b3b3b3b3b3b1"
    }
  }
}
```

### 7. Delete Message
**POST** `/api/client-chat/messages/:messageId/delete`

Delete a message (only own messages for regular users, any message for superAdmin).

**Path Parameters:**
- `messageId`: ID of the message to delete

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Updated message content",
    "deleted": {
      "isDeleted": true,
      "deletedAt": "2023-07-20T10:10:00.000Z",
      "deletedBy": "60f7b3b3b3b3b3b3b3b3b3b1"
    }
  }
}
```

### 8. Mark Message as Read
**POST** `/api/client-chat/messages/:messageId/read`

Mark a message as read.

**Path Parameters:**
- `messageId`: ID of the message to mark as read

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "status": "read",
    "readBy": [
      {
        "user": "60f7b3b3b3b3b3b3b3b3b3b2",
        "readAt": "2023-07-20T10:15:00.000Z"
      }
    ]
  }
}
```

### 9. Get Unread Count
**GET** `/api/client-chat/unread-count`

Get the count of unread messages for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "unreadCount": 5
  }
}
```

### 10. Search Messages
**GET** `/api/client-chat/search`

Search messages using text search.

**Query Parameters:**
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "Hello, I need help with my account",
        "type": "text",
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
        },
        "createdAt": "2023-07-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalMessages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

### 11. Get Chat Statistics
**GET** `/api/client-chat/stats`

Get chat statistics for the authenticated client.

**Response:**
```json
{
  "success": true,
  "message": "Chat statistics retrieved successfully",
  "data": {
    "totalMessages": 25,
    "unreadMessages": 3,
    "categories": ["general", "support", "billing"]
  }
}
```

### 12. Get Available Recipients
**GET** `/api/client-chat/recipients`

Get list of available recipients (admins and employees) for the client.

**Response:**
```json
{
  "success": true,
  "message": "Available recipients retrieved successfully",
  "data": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "username": "admin_user",
      "fullname": "John Admin",
      "role": "admin",
      "model": "Admin"
    },
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "username": "employee_user",
      "fullname": "Jane Employee",
      "role": "senior",
      "model": "Employee"
    }
  ]
}
```

### 13. Get Conversation List
**GET** `/api/client-chat/conversations`

Get list of conversations for the authenticated client.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Conversations per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Conversation list retrieved successfully",
  "data": {
    "conversations": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b2",
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
        },
        "lastMessage": "Hello, I need help with my account",
        "lastMessageAt": "2023-07-20T10:00:00.000Z",
        "unreadCount": 2
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalConversations": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

## Debug Endpoints

### 14. Debug User
**GET** `/api/client-chat/debug/user/:userId`

Get debug information about a specific user.

**Path Parameters:**
- `userId`: ID of the user to debug

**Response:**
```json
{
  "success": true,
  "message": "User debug information retrieved successfully",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "username": "client@example.com",
      "fullname": "John Client",
      "role": "premium-client",
      "model": "Client",
      "isActive": true
    },
    "currentUser": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "role": "admin"
    }
  }
}
```

### 15. Debug List All Users
**GET** `/api/client-chat/debug/users`

Get list of all users for debugging purposes.

**Response:**
```json
{
  "success": true,
  "message": "All users retrieved successfully",
  "data": {
    "admins": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b1",
        "username": "admin_user",
        "fullname": "John Admin",
        "role": "admin",
        "model": "Admin"
      }
    ],
    "employees": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b2",
        "username": "employee_user",
        "fullname": "Jane Employee",
        "role": "senior",
        "model": "Employee"
      }
    ],
    "clients": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "client@example.com",
        "fullname": "John Client",
        "role": "premium-client",
        "model": "Client"
      }
    ]
  }
}
```

## Usage Examples

### Example 1: Client sends message to Admin
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <client_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "senderModel": "Client",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "recipientModel": "Admin",
  "content": "Hello, I need help with my account",
  "type": "text",
  "priority": "normal",
  "category": "support"
}
```

### Example 2: Client sends message to superAdmin
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <client_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "senderModel": "Client",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "recipientModel": "superAdmin",
  "content": "Hello superAdmin, I need urgent help with my account",
  "type": "text",
  "priority": "urgent",
  "category": "support"
}
```

**Note:** Use "superAdmin" as recipientModel for superAdmin users. The system will automatically handle the lookup in the Admin model.

### Example 3: Client sends message to CompanyAdmin
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <client_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "senderModel": "Client",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "recipientModel": "CompanyAdmin",
  "content": "Hello CompanyAdmin, I need help with my company account",
  "type": "text",
  "priority": "normal",
  "category": "support"
}
```

**Note:** Use "CompanyAdmin" as recipientModel for CompanyAdmin users. The system will automatically handle the lookup in the Admin model.

### Example 4: Client sends message to Employee
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <client_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "senderModel": "Client",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "recipientModel": "Employee",
  "content": "Can you help me with the new feature?",
  "type": "text",
  "priority": "high",
  "category": "feature-request"
}
```

### Example 5: Admin sends message to Client
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "senderModel": "Admin",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "recipientModel": "Client",
  "content": "Hello! How can I help you today?",
  "type": "text",
  "priority": "normal",
  "category": "support"
}
```

### Example 6: Employee sends message to Client
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <employee_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "senderModel": "Employee",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "recipientModel": "Client",
  "content": "I can help you with that feature request!",
  "type": "text",
  "priority": "normal",
  "category": "feature-request"
}
```

### Example 7: SuperAdmin sends message to Client
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <superadmin_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "senderModel": "superAdmin",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "recipientModel": "Client",
  "content": "Hello! I'm here to help you with any issues.",
  "type": "text",
  "priority": "normal",
  "category": "support"
}
```

### Example 8: CompanyAdmin sends message to Client
```bash
POST http://localhost:3500/api/client-chat/messages
Authorization: Bearer <companyadmin_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "senderModel": "CompanyAdmin",
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "recipientModel": "Client",
  "content": "Hello! How can I assist you today?",
  "type": "text",
  "priority": "normal",
  "category": "support"
}
```

### Example 9: SuperAdmin sends message to Client (using dedicated endpoint)
```bash
POST http://localhost:3500/api/client-chat/messages/to-client
Authorization: Bearer <superadmin_jwt_token>
Content-Type: application/json

{
  "clientId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "content": "Hello! I noticed you've been having some issues. How can I help you today?",
  "type": "text",
  "priority": "normal",
  "category": "support"
}
```

### Example 10: Get conversation between client and admin
```bash
GET http://localhost:3500/api/client-chat/conversation/60f7b3b3b3b3b3b3b3b3b3b2?page=1&limit=50
Authorization: Bearer <client_jwt_token>
```

### Example 11: Admin gets messages sent to them
```bash
GET http://localhost:3500/api/client-chat/recipient-messages?page=1&limit=50
Authorization: Bearer <admin_jwt_token>
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "senderId, senderModel, recipientId, recipientModel, and content are required",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to send messages",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Recipient not found",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to send message: Database connection error",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

## Features

- ✅ **Client ↔ Admin/Employee messaging**
- ✅ **SuperAdmin → Client messaging** (bidirectional communication)
- ✅ **Message categorization** (support, billing, technical, etc.)
- ✅ **Priority levels** (low, normal, high, urgent)
- ✅ **Message editing and deletion**
- ✅ **Read status tracking**
- ✅ **Search functionality**
- ✅ **Chat statistics**
- ✅ **Conversation management**
- ✅ **Multi-tenant support**
- ✅ **Comprehensive error handling**
- ✅ **Debug endpoints**

## Authorization Rules

- **superAdmin**: Can access all messages, perform any action, and send messages to clients
- **admin/CompanyAdmin**: Can access messages sent to them and their own messages
- **employees**: Can access messages sent to them and their own messages
- **clients**: Can access their own messages and send messages to admins/employees

## Rate Limiting

Currently disabled, but can be enabled by uncommenting the rate limiting middleware in `server.js`.

## Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Message content length limits
- File type validation for attachments
