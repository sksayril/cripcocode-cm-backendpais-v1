# Admin Chat System API Documentation

A comprehensive bidirectional chat system API that allows superAdmin, admin, and CompanyAdmin users to communicate with Admin, Employee, and Client users.

## 🔐 Authentication

All chat endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **superAdmin**: Can chat with any user (Admin, Employee, Client), edit/delete any message
- **admin**: Can chat with any user (Admin, Employee, Client), edit/delete their own messages
- **CompanyAdmin**: Can chat with any user (Admin, Employee, Client), edit/delete their own messages

## 📋 Supported Users

- **Admin**: superAdmin, admin, CompanyAdmin
- **Employee**: All employee roles
- **Client**: All client types

## 📋 API Endpoints

### 1. Send Message
**POST** `/api/chat/messages`

Send a message to any user (Admin, Employee, or Client).

**Request Body:**
```json
{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "senderModel": "Admin",
  "content": "Hello, how are you?",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "recipientModel": "Employee"
}
```

**Field Descriptions:**
- `senderId` (string, required): ID of the user sending the message
- `senderModel` (string, optional): Model of the sender - "Admin", "Employee", "Client", "superAdmin", "CompanyAdmin" (auto-detected if not provided)
- `content` (string, required): Message content
- `type` (string, optional): Message type - "text", "image", "file" (default: "text")
- `attachments` (array, optional): Array of attachment objects
- `recipientId` (string, required): ID of the user receiving the message
- `recipientModel` (string, optional): Model of the recipient - "Admin", "Employee", "Client", "superAdmin", "CompanyAdmin" (auto-detected if not provided)

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
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "model": "Admin",
      "name": "John Admin",
      "role": "superAdmin"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "model": "Employee",
      "name": "Jane Employee",
      "role": "developer"
    },
    "status": "sent",
    "edited": {
      "isEdited": false,
      "editCount": 0
    },
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:00:00.000Z"
  }
}
```

### 2. Get Conversation
**GET** `/api/chat/conversation/:userId?page=1&limit=50`

Get conversation between current user and specified user (Admin, Employee, or Client).

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
          "role": "superAdmin"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
        },
        "status": "sent",
        "edited": {
          "isEdited": false,
          "editCount": 0
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
      "limit": 50
    }
  }
}
```

### 3. Get User Messages
**GET** `/api/chat/messages?page=1&limit=50`

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
          "role": "superAdmin"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
        },
        "status": "sent",
        "edited": {
          "isEdited": false,
          "editCount": 0
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
      "limit": 50
    }
  }
}
```

### 4. Edit Message
**POST** `/api/chat/messages/:messageId/edit`

Edit a message (only own messages for admin, any message for superAdmin).

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
      "role": "superAdmin"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "model": "Admin",
      "name": "Jane Admin",
      "role": "admin"
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
**POST** `/api/chat/messages/:messageId/delete`

Delete a message (only own messages for admin, any message for superAdmin).

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
**POST** `/api/chat/messages/:messageId/read`

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
    "readBy": [
      {
        "user": "60f7b3b3b3b3b3b3b3b3b3b3",
        "readAt": "2023-07-20T10:15:00.000Z"
      }
    ]
  }
}
```

### 7. Get Unread Count
**GET** `/api/chat/unread-count`

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
**GET** `/api/chat/search?query=hello&page=1&limit=20`

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
          "role": "superAdmin"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
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
**GET** `/api/chat/stats`

Get chat statistics for the current user.

**Response:**
```json
{
  "success": true,
  "message": "Chat statistics retrieved successfully",
  "data": {
    "totalMessages": 150,
    "unreadMessages": 5,
    "sentMessages": 75,
    "receivedMessages": 75
  }
}
```

### 10. Get Available Users
**GET** `/api/chat/available-users`

Get list of all available users for chat (Admin, Employee, Client - excludes current user).

**Response:**
```json
{
  "success": true,
  "message": "Available users retrieved successfully",
  "data": {
    "admins": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "jane_admin",
        "fullname": "Jane Admin",
        "role": "admin",
        "model": "Admin",
        "createdAt": "2023-07-20T09:00:00.000Z"
      }
    ],
    "employees": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "username": "john_employee",
        "fullname": "John Employee",
        "role": "developer",
        "model": "Employee",
        "createdAt": "2023-07-20T09:30:00.000Z"
      }
    ],
    "clients": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "username": "client1",
        "fullname": "Client One",
        "role": "premium-client",
        "model": "Client",
        "createdAt": "2023-07-20T10:00:00.000Z"
      }
    ]
  }
}
```

## 🔧 Debug Endpoints

### Debug User
**GET** `/api/chat/debug/user/:userId`

Debug endpoint to check user information.

**Response:**
```json
{
  "success": true,
  "message": "User debug info retrieved successfully",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "jane_admin",
      "fullname": "Jane Admin",
      "role": "admin",
      "isActive": true,
      "model": "Admin"
    },
    "currentUser": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "model": "Admin",
      "role": "superAdmin"
    }
  }
}
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Recipient ID and content are required",
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
  "message": "User not found",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

## 🚀 Usage Examples

### Send a Message (cURL)
```bash
curl -X POST http://localhost:3500/api/chat/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "senderModel": "Admin",
    "recipientId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "recipientModel": "Employee",
    "content": "Hello, how are you?",
    "type": "text"
  }'
```

### Get Conversation (cURL)
```bash
curl -X GET "http://localhost:3500/api/chat/conversation/60f7b3b3b3b3b3b3b3b3b3b3?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Edit Message (cURL)
```bash
curl -X PUT http://localhost:3500/api/chat/messages/60f7b3b3b3b3b3b3b3b3b3b5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated message content"
  }'
```

### Delete Message (cURL)
```bash
curl -X DELETE http://localhost:3500/api/chat/messages/60f7b3b3b3b3b3b3b3b3b3b5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Notes

- All endpoints require authentication
- Only superAdmin, admin, and CompanyAdmin users can access chat functionality
- Super-admin can edit/delete any message
- Admin and CompanyAdmin users can only edit/delete their own messages
- Supports bidirectional messaging between Admin, Employee, and Client users
- Messages are soft-deleted (marked as deleted, not removed from database)
- All timestamps are in ISO 8601 format
- Pagination is available for list endpoints
- Search is case-insensitive
- User models are auto-detected if not explicitly provided

---

**Built with ❤️ for Admin Communication Excellence**
