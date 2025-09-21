# Super Admin Chat System API Documentation

A comprehensive chat system API exclusively for super admin users with advanced features including system messages, announcements, and enhanced message management.

## 🔐 Authentication

All endpoints require authentication using JWT tokens with **superAdmin** role. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **superAdmin**: Exclusive access to this chat system with full message management capabilities

## 📋 API Endpoints

### 1. Send Message
**POST** `/api/super-admin-chat/messages`

Send a message from super admin to any user (Admin, Employee, or Client).

**Request Body:**
```json
{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "content": "Hello, this is an important message from super admin",
  "type": "text",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "recipientModel": "Admin",
  "priority": "high",
  "category": "general",
  "isSystemMessage": false,
  "isAnnouncement": false,
  "isEmergency": false,
  "visibility": "private",
  "scheduledAt": null,
  "expiresAt": null,
  "tags": ["important", "update"],
  "relatedProject": "60f7b3b3b3b3b3b3b3b3b3b4",
  "relatedCompany": "60f7b3b3b3b3b3b3b3b3b3b5"
}
```

**Field Descriptions:**
- `senderId` (string, required): ID of the super admin sending the message (must be a valid superAdmin user)
- `content` (string, required): Message content (max 10000 characters)
- `recipientId` (string, required): ID of the recipient user
- `recipientModel` (string, required): Model type - "Admin", "Employee", "Client", "CompanyAdmin", or "superAdmin"
- `type` (string, optional): Message type - "text", "image", "file", "link", "system", "announcement", "command" (default: "text")
- `attachments` (array, optional): Array of attachment objects
- `priority` (string, optional): Priority level - "low", "normal", "high", "urgent", "critical" (default: "normal")
- `category` (string, optional): Message category - "general", "system", "announcement", "support", "billing", "technical", "security", "policy", "maintenance", "emergency" (default: "general")
- `isSystemMessage` (boolean, optional): Mark as system message (default: false)
- `isAnnouncement` (boolean, optional): Mark as announcement (default: false)
- `isEmergency` (boolean, optional): Mark as emergency message (default: false)
- `visibility` (string, optional): Message visibility - "public", "private", "company", "department" (default: "private")
- `scheduledAt` (string, optional): ISO date for scheduled messages
- `expiresAt` (string, optional): ISO date for message expiry
- `tags` (array, optional): Array of tags for organization
- `relatedProject` (string, optional): Related project ID
- `relatedCompany` (string, optional): Related company ID

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "content": "Hello, this is an important message from super admin",
    "type": "text",
    "sender": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "model": "Admin",
      "name": "Super Admin",
      "role": "superAdmin",
      "company": "60f7b3b3b3b3b3b3b3b3b3b5"
    },
    "recipient": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "model": "CompanyAdmin",
      "name": "Company Admin",
      "role": "CompanyAdmin",
      "company": "60f7b3b3b3b3b3b3b3b3b3b5"
    },
    "status": "sent",
    "priority": "high",
    "category": "general",
    "isSystemMessage": false,
    "isAnnouncement": false,
    "isEmergency": false,
    "visibility": "private",
    "tags": ["important", "update"],
    "readBy": [],
    "edited": {
      "isEdited": false,
      "editCount": 0
    },
    "deleted": {
      "isDeleted": false
    },
    "auditTrail": [
      {
        "action": "sent",
        "performedBy": "60f7b3b3b3b3b3b3b3b3b3b1",
        "performedAt": "2023-07-20T10:00:00.000Z",
        "details": "Message sent"
      }
    ],
    "createdAt": "2023-07-20T10:00:00.000Z",
    "updatedAt": "2023-07-20T10:00:00.000Z"
  }
}
```

### 2. Send Announcement
**POST** `/api/super-admin-chat/announcements`

Send announcement to multiple users simultaneously.

**Request Body:**
```json
{
  "recipients": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "model": "Admin"
    },
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "model": "Employee"
    }
  ],
  "content": "System maintenance scheduled for tomorrow at 2 AM",
  "type": "announcement",
  "priority": "high",
  "category": "announcement",
  "visibility": "public",
  "scheduledAt": "2023-07-21T02:00:00.000Z",
  "expiresAt": "2023-07-22T02:00:00.000Z",
  "tags": ["maintenance", "scheduled"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement sent successfully",
  "data": {
    "messages": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "content": "System maintenance scheduled for tomorrow at 2 AM",
        "isAnnouncement": true,
        "category": "announcement"
      }
    ],
    "count": 2
  }
}
```

### 3. Send System Message
**POST** `/api/super-admin-chat/system-messages`

Send system message to specific user.

**Request Body:**
```json
{
  "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
  "content": "Your account has been updated with new permissions",
  "type": "system",
  "attachments": [],
  "recipientId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "recipientModel": "Admin",
  "priority": "high",
  "category": "system"
}
```

### 4. Get Conversation
**GET** `/api/super-admin-chat/conversation/:recipientId?page=1&limit=50`

Get conversation between super admin and specified recipient.

**Path Parameters:**
- `recipientId` (string): ID of the recipient user

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
          "name": "Super Admin",
          "role": "superAdmin"
        },
        "recipient": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "model": "Admin",
          "name": "Jane Admin",
          "role": "admin"
        },
        "status": "read",
        "priority": "normal",
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

### 5. Get Super Admin Messages
**GET** `/api/super-admin-chat/messages?page=1&limit=50`

Get all messages for the super admin (all conversations).

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Messages per page (default: 50)

### 6. Get System Messages
**GET** `/api/super-admin-chat/system-messages?page=1&limit=50`

Get all system messages sent by super admin.

### 7. Get Announcements
**GET** `/api/super-admin-chat/announcements?page=1&limit=50`

Get all announcements sent by super admin.

### 8. Get Message by ID
**GET** `/api/super-admin-chat/messages/:messageId`

Get detailed information about a specific message.

### 9. Get Message Audit Trail
**GET** `/api/super-admin-chat/messages/:messageId/audit-trail`

Get complete audit trail for a specific message.

**Response:**
```json
{
  "success": true,
  "message": "Audit trail retrieved successfully",
  "data": {
    "auditTrail": [
      {
        "action": "sent",
        "performedBy": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "username": "superadmin",
          "fullname": "Super Admin",
          "role": "superAdmin"
        },
        "performedAt": "2023-07-20T10:00:00.000Z",
        "details": "Message sent"
      },
      {
        "action": "edited",
        "performedBy": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "username": "superadmin",
          "fullname": "Super Admin",
          "role": "superAdmin"
        },
        "performedAt": "2023-07-20T10:05:00.000Z",
        "details": "Message content updated"
      }
    ]
  }
}
```

### 10. Edit Message
**PUT** `/api/super-admin-chat/messages/:messageId`

Edit a message content.

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
    "edited": {
      "isEdited": true,
      "editCount": 1,
      "lastEditedAt": "2023-07-20T10:05:00.000Z",
      "lastEditedBy": "60f7b3b3b3b3b3b3b3b3b3b1",
      "editHistory": [
        {
          "content": "Hello, how are you?",
          "editedAt": "2023-07-20T10:05:00.000Z",
          "editedBy": "60f7b3b3b3b3b3b3b3b3b3b1"
        }
      ]
    }
  }
}
```

### 11. Delete Message
**DELETE** `/api/super-admin-chat/messages/:messageId`

Soft delete a message (marks as deleted but preserves in database).

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
      "deletedBy": "60f7b3b3b3b3b3b3b3b3b3b1",
      "deleteReason": "Deleted by super admin"
    }
  }
}
```

### 12. Restore Message
**PATCH** `/api/super-admin-chat/messages/:messageId/restore`

Restore a previously deleted message.

### 13. Mark Message as Read
**POST** `/api/super-admin-chat/messages/:messageId/read`

Mark a message as read.

### 14. Get Unread Count
**GET** `/api/super-admin-chat/unread-count`

Get the number of unread messages for the super admin.

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

### 15. Search Messages
**GET** `/api/super-admin-chat/search?q=hello&page=1&limit=20`

Search messages by content and tags.

**Query Parameters:**
- `q` (string, required): Search query
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
        "tags": ["greeting"],
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

### 16. Get Chat Statistics
**GET** `/api/super-admin-chat/stats`

Get comprehensive chat statistics for the super admin.

**Response:**
```json
{
  "success": true,
  "message": "Chat statistics retrieved successfully",
  "data": {
    "totalMessages": 150,
    "receivedMessages": 25,
    "systemMessages": 10,
    "announcements": 5,
    "unreadCount": 3,
    "recipientDistribution": [
      {
        "_id": "Admin",
        "count": 100
      },
      {
        "_id": "Employee",
        "count": 30
      },
      {
        "_id": "Client",
        "count": 20
      }
    ],
    "categoryDistribution": [
      {
        "_id": "general",
        "count": 80
      },
      {
        "_id": "system",
        "count": 30
      },
      {
        "_id": "announcement",
        "count": 20
      },
      {
        "_id": "support",
        "count": 20
      }
    ]
  }
}
```

### 17. Get Available Recipients
**GET** `/api/super-admin-chat/recipients`

Get list of all available recipients for messaging.

**Response:**
```json
{
  "success": true,
  "message": "Available recipients retrieved successfully",
  "data": {
    "superAdmins": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b1",
        "name": "Super Admin",
        "role": "superAdmin",
        "model": "superAdmin",
        "company": "60f7b3b3b3b3b3b3b3b3b3b5"
      }
    ],
    "companyAdmins": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b2",
        "name": "Company Admin",
        "role": "CompanyAdmin",
        "model": "CompanyAdmin",
        "company": "60f7b3b3b3b3b3b3b3b3b3b5"
      }
    ],
    "admins": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Jane Admin",
        "role": "admin",
        "model": "Admin",
        "company": "60f7b3b3b3b3b3b3b3b3b3b5"
      }
    ],
    "employees": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "name": "John Employee",
        "role": "developer",
        "model": "Employee",
        "company": "60f7b3b3b3b3b3b3b3b3b3b5"
      }
    ],
    "clients": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b6",
        "name": "Bob Client",
        "role": "client",
        "model": "Client",
        "company": "60f7b3b3b3b3b3b3b3b3b3b7"
      }
    ]
  }
}
```

### 18. Debug Super Admin
**GET** `/api/super-admin-chat/debug/super-admin`

Debug endpoint to check super admin information.

**Response:**
```json
{
  "success": true,
  "message": "Super admin debug info retrieved successfully",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "role": "superAdmin",
      "isSuperAdmin": true,
      "adminInfo": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b1",
        "username": "superadmin",
        "fullname": "Super Admin",
        "role": "superAdmin",
        "isActive": true
      }
    }
  }
}
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid recipient model. Must be one of: Admin, Employee, Client, CompanyAdmin, superAdmin",
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
  "message": "Only super admin can use this chat system",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Message not found",
  "timestamp": "2023-07-20T10:00:00.000Z"
}
```

## 🚀 Usage Examples

### Send a Message (cURL)
```bash
curl -X POST http://localhost:3500/api/super-admin-chat/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "60f7b3b3b3b3b3b3b3b3b3b1",
    "content": "Hello, this is an important message",
    "type": "text",
    "attachments": [],
    "recipientId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "recipientModel": "Admin",
    "priority": "high",
    "category": "general",
    "tags": ["important"]
  }'
```

### Send Announcement (cURL)
```bash
curl -X POST http://localhost:3500/api/super-admin-chat/announcements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      {"id": "60f7b3b3b3b3b3b3b3b3b3b3", "model": "Admin"},
      {"id": "60f7b3b3b3b3b3b3b3b3b3b4", "model": "Employee"}
    ],
    "content": "System maintenance scheduled for tomorrow",
    "priority": "high",
    "category": "announcement"
  }'
```

### Get Conversation (cURL)
```bash
curl -X GET "http://localhost:3500/api/super-admin-chat/conversation/60f7b3b3b3b3b3b3b3b3b3b3?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Edit Message (cURL)
```bash
curl -X PUT http://localhost:3500/api/super-admin-chat/messages/60f7b3b3b3b3b3b3b3b3b3b5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated message content"
  }'
```

### Delete Message (cURL)
```bash
curl -X DELETE http://localhost:3500/api/super-admin-chat/messages/60f7b3b3b3b3b3b3b3b3b3b5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Key Features

### 🔐 **Super Admin Exclusive**
- Only users with `superAdmin` role can access this chat system
- Full message management capabilities
- System-wide communication powers

### 📢 **Advanced Message Types**
- **Regular Messages**: Standard communication
- **System Messages**: Automated system notifications
- **Announcements**: Broadcast messages to multiple users
- **Emergency Messages**: High-priority urgent communications

### 🏷️ **Message Organization**
- **Categories**: general, system, announcement, support, billing, technical, security, policy, maintenance, emergency
- **Priorities**: low, normal, high, urgent, critical
- **Tags**: Custom tagging system for better organization
- **Visibility**: public, private, company, department

### ⏰ **Message Scheduling & Expiry**
- Schedule messages for future delivery
- Set message expiry dates for temporary communications
- Automatic cleanup of expired messages

### 📊 **Advanced Analytics**
- Comprehensive chat statistics
- Message distribution by recipient type
- Category-based message analysis
- Read receipt tracking

### 🔍 **Search & Discovery**
- Full-text search across message content
- Tag-based search functionality
- Paginated search results

### 📋 **Audit Trail**
- Complete message history tracking
- Edit history with timestamps
- Action logging for compliance
- User activity monitoring

### 🔄 **Message Management**
- Edit messages with history preservation
- Soft delete with restore capability
- Bulk operations for announcements
- Message archiving

## 🔒 Security Features

- **Role-based Access Control**: Only superAdmin can access
- **Message Encryption**: Secure message transmission
- **Audit Logging**: Complete activity tracking
- **Data Retention**: Configurable message retention policies
- **Access Logging**: Track who accessed what and when

## 📈 Performance Features

- **Pagination**: Efficient data loading
- **Indexing**: Optimized database queries
- **Caching**: Reduced database load
- **Bulk Operations**: Efficient mass messaging
- **Real-time Updates**: Instant message delivery

---

**Built with ❤️ for Super Admin Communication Excellence**
