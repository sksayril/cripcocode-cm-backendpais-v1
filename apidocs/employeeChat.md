# Employee Chat System API Documentation

A comprehensive chat system API that allows admin, CompanyAdmin, employee, and client users to communicate with each other through direct messages, including employee-to-employee communication.

## 🔐 Authentication

All employee chat endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **superAdmin**: Can chat with any user (Admin, CompanyAdmin, Employee, Client), edit/delete any message
- **admin**: Can chat with employees, clients, and other admins, edit/delete their own messages
- **CompanyAdmin**: Can chat with employees, clients, and other admins, edit/delete their own messages
- **employee** (junior, senior, lead, manager, director, designer, developer, analyst, specialist, coordinator, assistant, consultant, other): Can chat with admin, CompanyAdmin, superAdmin, client users, and other employees, edit/delete their own messages
- **client/premium-client/enterprise-client**: Can chat with admin, CompanyAdmin, superAdmin, and employee users, edit/delete their own messages

## 📋 API Endpoints

### 1. Send Message
**POST** `/api/employee-chat/messages`

Send a message between admin/CompanyAdmin, employee, and client users, including employee-to-employee communication.

**Request Body:**
```json
{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "senderModel": "Admin",
  "content": "Hello, how are you?",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "recipientModel": "Employee"
}
```

**Field Descriptions:**
- `senderId` (string, required): ID of the user sending the message
- `senderModel` (string, required): Model type - "Admin", "CompanyAdmin", "superAdmin", "Employee", or "Client"
  - **Note**: "superAdmin" and "CompanyAdmin" are **roles** within the Admin model, not separate models
  - **Note**: "premium-client" and "enterprise-client" are **roles** within the Client model, not separate models
  - Always use "Admin" as the model type for all admin users regardless of their role (superAdmin, CompanyAdmin, admin)
  - Always use "Client" as the model type for all client users regardless of their role
- `content` (string, required): Message content
- `type` (string, optional): Message type - "text", "image", "file" (default: "text")
- `attachments` (array, optional): Array of attachment objects
- `recipientId` (string, required): ID of the user receiving the message
- `recipientModel` (string, required): Model type - "Admin", "CompanyAdmin", "superAdmin", "Employee", or "Client"
  - **Note**: "superAdmin" and "CompanyAdmin" are **roles** within the Admin model, not separate models
  - **Note**: "premium-client" and "enterprise-client" are **roles** within the Client model, not separate models
  - Always use "Admin" as the model type for all admin users regardless of their role (superAdmin, CompanyAdmin, admin)
  - Always use "Client" as the model type for all client users regardless of their role

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Hello, how are you?",
    "type": "text",
    "sender": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "model": "Admin",
      "name": "John Admin",
      "role": "admin"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "model": "Employee",
      "name": "Jane Employee",
      "role": "employee"
    },
    "status": "sent",
    "createdAt": "2023-07-20T10:00:00.000Z"
  }
}
```

### 2. Get Conversation
**GET** `/api/employee-chat/conversation/:userId?page=1&limit=50`

Get conversation between current user and specified user.

**Path Parameters:**
- `userId` (string): ID of the user to get conversation with

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "Hello, how are you?",
        "type": "text",
        "sender": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "model": "Admin",
          "name": "John Admin",
          "role": "admin"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "model": "Employee",
          "name": "Jane Employee",
          "role": "employee"
        },
        "status": "sent",
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

### 3. Get User Messages
**GET** `/api/employee-chat/messages?page=1&limit=50`

Get all messages for the current user (all conversations).

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "Hello, how are you?",
        "type": "text",
        "sender": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "model": "Admin",
          "name": "John Admin",
          "role": "admin"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "model": "Employee",
          "name": "Jane Employee",
          "role": "employee"
        },
        "status": "sent",
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

### 4. Edit Message
**POST** `/api/employee-chat/messages/:messageId/edit`

Edit a message (only own messages for regular users, any message for superAdmin).

**Path Parameters:**
- `messageId` (string): ID of the message to edit

**Request Body:**
```json
{
  "content": "Updated message content"
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
    "type": "text",
    "sender": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "model": "Admin",
      "name": "John Admin",
      "role": "admin"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "model": "Employee",
      "name": "Jane Employee",
      "role": "employee"
    },
    "status": "sent",
    "edited": {
      "isEdited": true,
      "editCount": 1,
      "lastEditedAt": "2023-07-20T10:05:00.000Z",
      "lastEditedBy": "60f7b3b3b3b3b3b3b3b3b3b1"
    },
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:05:00.000Z"
  }
}
```

### 5. Delete Message
**POST** `/api/employee-chat/messages/:messageId/delete`

Delete a message (only own messages for regular users, any message for superAdmin).

**Path Parameters:**
- `messageId` (string): ID of the message to delete

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Updated message content",
    "isDeleted": true,
    "deletedAt": "2023-07-20T10:10:00.000Z",
    "deletedBy": "60f7b3b3b3b3b3b3b3b3b3b1"
  }
}
```

### 6. Mark Message as Read
**POST** `/api/employee-chat/messages/:messageId/read`

Mark a message as read.

**Path Parameters:**
- `messageId` (string): ID of the message to mark as read

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Hello, how are you?",
    "type": "text",
    "sender": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "model": "Admin",
      "name": "John Admin",
      "role": "admin"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "model": "Employee",
      "name": "Jane Employee",
      "role": "employee"
    },
    "status": "read",
    "readBy": [
      {
        "user": "60f7b3b3b3b3b3b3b3b3b3b2",
        "readAt": "2023-07-20T10:15:00.000Z"
      }
    ],
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:15:00.000Z"
  }
}
```

### 7. Get Unread Count
**GET** `/api/employee-chat/unread-count`

Get the number of unread messages for the current user.

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

### 8. Search Messages
**GET** `/api/employee-chat/search?query=hello&page=1&limit=20`

Search messages by content.

**Query Parameters:**
- `query` (string, required): Search term
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "Hello, how are you?",
        "type": "text",
        "sender": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "model": "Admin",
          "name": "John Admin",
          "role": "admin"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "model": "Employee",
          "name": "Jane Employee",
          "role": "employee"
        },
        "status": "sent",
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

### 9. Get Chat Statistics
**GET** `/api/employee-chat/stats`

Get chat statistics for the current user.

**Response:**
```json
{
  "success": true,
  "message": "Chat statistics retrieved successfully",
  "data": {
    "totalMessages": 25,
    "sentMessages": 12,
    "receivedMessages": 13,
    "unreadMessages": 3
  }
}
```

### 10. Get Available Users
**GET** `/api/employee-chat/available-users`

Get list of available users for chat (Admin and Employee users).

**Response:**
```json
{
  "success": true,
  "message": "Available users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b1",
        "username": "john_admin",
        "fullname": "John Admin",
        "role": "admin",
        "model": "Admin"
      },
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b2",
        "username": "jane_employee",
        "fullname": "Jane Employee",
        "role": "employee",
        "model": "Employee"
      }
    ]
  }
}
```

## 🔧 Usage Examples

### Example 1: Admin sends message to Employee
```bash
POST http://localhost:3500/api/employee-chat/messages
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "senderModel": "Admin",
  "content": "Hello employee, how is the project going?",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "recipientModel": "Employee"
}
```

### Example 2: superAdmin sends message to Employee
```bash
POST http://localhost:3500/api/employee-chat/messages
Authorization: Bearer <superadmin_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "senderModel": "Admin",
  "content": "Hello employee, how is your work progressing?",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "recipientModel": "Employee"
}
```

**Note**: superAdmin is a role within the Admin model, so use `"Admin"` as the `senderModel`. The system will recognize the user as superAdmin based on their actual role in the database.

### Example 3: Client sends message to Employee
```bash
POST http://localhost:3500/api/employee-chat/messages
Authorization: Bearer <client_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "senderModel": "Client",
  "content": "Hi employee, I have a question about my project status.",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "recipientModel": "Employee"
}
```

**Important**: Even if the client has the role "premium-client" or "enterprise-client", always use `"Client"` as the `senderModel`. The role is determined by the user's actual role in the database, not by the model type.

### Example 4: Employee sends message to another Employee
```bash
POST http://localhost:3500/api/employee-chat/messages
Authorization: Bearer <employee_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "senderModel": "Employee",
  "content": "Hi colleague, can you help me with the project documentation?",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b5",
  "recipientModel": "Employee"
}
```

### Example 5: Employee sends message to CompanyAdmin
```bash
POST http://localhost:3500/api/employee-chat/messages
Authorization: Bearer <employee_jwt_token>
Content-Type: application/json

{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "senderModel": "Employee",
  "content": "Hi CompanyAdmin, I need help with the task assignment.",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "recipientModel": "Admin"
}
```

### Example 6: Get conversation between Admin and Employee
```bash
GET http://localhost:3500/api/employee-chat/conversation/60f7b3b3b3b3b3b3b3b3b3b2?page=1&limit=20
Authorization: Bearer <admin_jwt_token>
```

## 🔒 Authorization Rules

**superAdmin:**
- ✅ Can chat with any user (Admin, CompanyAdmin, Employee, Client)
- ✅ Can send messages as superAdmin to any user
- ✅ Can edit/delete any message
- ✅ Can view all conversations
- ✅ Can search all messages
- ✅ Full system access for chat functionality

**admin & CompanyAdmin:**
- ✅ Can chat with employees, clients, and other admins
- ✅ Can send messages as Admin/CompanyAdmin to employees and clients
- ✅ Can edit/delete their own messages only
- ✅ Can view their own conversations
- ✅ Can search their own messages

**employee** (all roles: junior, senior, lead, manager, director, designer, developer, analyst, specialist, coordinator, assistant, consultant, other):
- ✅ Can chat with admin, CompanyAdmin, superAdmin, client users, and other employees
- ✅ Can send messages as Employee to any admin role, clients, and other employees
- ✅ Can edit/delete their own messages only
- ✅ Can view their own conversations
- ✅ Can search their own messages

**client/premium-client/enterprise-client:**
- ✅ Can chat with admin, CompanyAdmin, superAdmin, and employee users
- ✅ Can send messages as Client to any admin role and employees
- ✅ Can edit/delete their own messages only
- ✅ Can view their own conversations
- ✅ Can search their own messages

## 📊 Features

- ✅ **Cross-Model Communication**: Admin ↔ Employee ↔ Client messaging, Employee ↔ Employee messaging, superAdmin ↔ Any user
- ✅ **Role-based Access**: Different permissions for different roles
- ✅ **Message Management**: Edit, delete, mark as read
- ✅ **Search Functionality**: Search through message content
- ✅ **Pagination Support**: Efficient handling of large message histories
- ✅ **Real-time Updates**: Messages are delivered instantly
- ✅ **Message History**: Complete conversation history
- ✅ **Unread Tracking**: Track unread message counts
- ✅ **Statistics**: Get chat usage statistics
- ✅ **User Discovery**: Find available users for chat

## ⚠️ Important Notes

1. **Model Specification**: Always specify both `senderModel` and `recipientModel`
2. **User Validation**: Both sender and recipient must exist and be active
3. **Authorization**: Users can only access messages they are part of
4. **Self-Messaging**: Users cannot send messages to themselves
5. **Message Persistence**: All messages are stored in the database
6. **Security**: Messages are only visible to the sender and recipient

The Employee Chat System provides comprehensive communication capabilities between admin and employee users! 💬🚀
