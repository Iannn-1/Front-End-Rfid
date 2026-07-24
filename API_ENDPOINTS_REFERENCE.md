# Backend API Endpoints Reference

This document lists all API endpoints that the frontend expects from your backend.

**Base URL:** `http://localhost:3001/api/v1`

---

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "admin@school.edu",
  "password": "password123"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user-1",
      "name": "Admin User",
      "email": "admin@school.edu",
      "role": "admin"
    }
  }
}
```

---

## Dashboard

### Get Dashboard Stats
```http
GET /dashboard/stats

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 1248,
      "presentToday": 1052,
      "activeTags": 850,
      "activeReaders": 18
    }
  }
}
```

### Get Today's Attendance Summary
```http
GET /dashboard/attendance

Response (200 OK):
{
  "success": true,
  "data": {
    "buckets": [
      {
        "label": "Grade 1",
        "group": "Elementary",
        "present": 45,
        "absent": 3,
        "late": 2
      },
      {
        "label": "Grade 7",
        "group": "High School",
        "present": 120,
        "absent": 8,
        "late": 5
      }
      // ... more buckets
    ]
  }
}
```

### Get Main Gate Monitor Data
```http
GET /dashboard/doors

Response (200 OK):
{
  "success": true,
  "data": {
    "gate": {
      "id": "gate-1",
      "name": "Main Gate",
      "status": "online",
      "lastHeartbeat": "2024-01-15T10:30:00Z"
    },
    "totalIn": 156,
    "totalOut": 23,
    "scans": [
      {
        "id": "scan-1",
        "studentName": "John Doe",
        "studentId": "STU001",
        "level": "High School",
        "direction": "in",
        "time": "2024-01-15T10:28:00Z"
      }
      // ... more recent scans
    ]
  }
}
```

---

## Students

### List Students
```http
GET /students?page=1&pageSize=10&search=john&studentType=college&grade=1&course=BSIT&status=active

Query Parameters:
- page (optional): Page number (default: 1)
- pageSize (optional): Items per page (default: 10)
- search (optional): Search by name, email, or tag
- studentType (optional): elementary|highschool|seniorhigh|college
- grade (optional): Grade level or year
- course (optional): Course name (for college students)
- status (optional): active|disabled

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "student-1",
        "name": "John Doe",
        "email": "john@school.edu",
        "studentType": "college",
        "grade": 1,
        "section": null,
        "college": "College of Engineering",
        "course": "BS Computer Science (BSCS)",
        "status": "active",
        "tagId": "TAG-001",
        "lastSeen": "2024-01-15T10:28:00Z",
        "photoUrl": "https://example.com/photo.jpg"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 1248
  }
}
```

### Create Student
```http
POST /students
Content-Type: application/json

Request Body:
{
  "name": "Jane Smith",
  "email": "jane@school.edu",
  "studentType": "highschool",
  "grade": 7,
  "section": "A",
  "tagId": "TAG-002",
  "photoUrl": "data:image/jpeg;base64,..."
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "student-2",
    "name": "Jane Smith",
    // ... full student object
  }
}
```

### Get Student Details
```http
GET /students/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "student": {
      "id": "student-1",
      "name": "John Doe",
      // ... full student object including:
      "location": "Library",
      "emergencyContact": "Jane Doe",
      "emergencyPhone": "+1234567890"
    }
  }
}
```

### Update Student
```http
PATCH /students/:id
Content-Type: application/json

Request Body:
{
  "location": "Updated location",
  "emergencyContact": "Updated contact"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "student-1",
    // ... updated student object
  }
}
```

### Delete Student
```http
DELETE /students/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "message": "Student deleted successfully"
  }
}
```

### Get Student Events
```http
GET /students/:id/events

Response (200 OK):
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event-1",
        "time": "2024-01-15T10:28:00Z",
        "door": "Main Gate",
        "direction": "IN",
        "status": "allowed"
      }
    ]
  }
}
```

---

## Attendance

### Get Attendance Records
```http
GET /attendance?date=2024-01-15&grade=7&status=present

Query Parameters:
- date (optional): Filter by date (YYYY-MM-DD)
- grade (optional): Filter by grade
- status (optional): present|absent|late|excused

Response (200 OK):
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "att-1",
        "studentId": "STU001",
        "studentName": "John Doe",
        "grade": 7,
        "section": "A",
        "status": "present",
        "location": "Library",
        "checkInTime": "2024-01-15T07:30:00Z",
        "checkOutTime": null,
        "lastSeen": "2024-01-15T10:28:00Z"
      }
    ]
  }
}
```

### Get Active Alerts
```http
GET /attendance/alerts

Response (200 OK):
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-1",
        "type": "missing",
        "severity": "critical",
        "message": "Student has not checked in today",
        "studentName": "John Smith",
        "location": null,
        "timestamp": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### Quick Search Students
```http
GET /attendance/search?q=john

Response (200 OK):
{
  "success": true,
  "data": {
    "results": [
      {
        "studentId": "STU001",
        "studentName": "John Doe",
        "grade": 7,
        "section": "A",
        "currentLocation": "Library",
        "lastSeen": "2024-01-15T10:28:00Z",
        "status": "present"
      }
    ]
  }
}
```

### Get Location Heatmap
```http
GET /locations/heatmap

Response (200 OK):
{
  "success": true,
  "data": {
    "locations": [
      {
        "name": "Library",
        "count": 78,
        "capacity": 80,
        "status": "crowded",
        "recentActivity": 5
      }
    ]
  }
}
```

---

## RFID Tags

### List Tags
```http
GET /tags?page=1&pageSize=10&search=TAG&status=assigned&type=student

Query Parameters:
- page, pageSize (pagination)
- search (UID or owner search)
- status: unassigned|assigned|lost|disabled|retired
- type: student|worker|visitor

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "tag-1",
        "uid": "TAG-001",
        "status": "assigned",
        "type": "student",
        "ownerId": "student-1",
        "ownerType": "student",
        "issuedAt": "2024-01-01T00:00:00Z",
        "revokedAt": null,
        "lastSeen": "2024-01-15T10:28:00Z"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 850
  }
}
```

### Get Tag Details
```http
GET /tags/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "tag": {
      "id": "tag-1",
      "uid": "TAG-001",
      // ... full tag object
    }
  }
}
```

### Get Tag Events
```http
GET /tags/:id/events

Response (200 OK):
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event-1",
        "time": "2024-01-15T10:28:00Z",
        "door": "Main Gate",
        "direction": "IN",
        "status": "allowed"
      }
    ]
  }
}
```

---

## Reports

### Generate Report
```http
POST /reports/generate
Content-Type: application/json

Request Body:
{
  "type": "attendance",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-15",
  "filterLevel": "highschool",
  "filterStatus": "present"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "rows": [
      {
        "Student ID": "STU001",
        "Name": "John Doe",
        "Level": "High School",
        "Grade": 7,
        "Section": "A",
        "Status": "present",
        "Date": "2024-01-15"
      }
    ],
    "total": 1052
  }
}
```

### Get Report History
```http
GET /reports/history

Response (200 OK):
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "report-1",
        "type": "attendance",
        "generatedAt": "2024-01-15T10:00:00Z",
        "rows": 1052,
        "generatedBy": "Admin User"
      }
    ]
  }
}
```

### Get Report Statistics
```http
GET /reports/stats

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 1248,
      "activeStudents": 1200,
      "presentToday": 1052,
      "lateToday": 48,
      "absentToday": 100,
      "attendanceRate": 88.4,
      "totalScans": 2156,
      "totalTags": 1000,
      "assignedTags": 850,
      "totalHolidays": 15,
      "adminUsers": 8
    }
  }
}
```

---

## Settings - User Management

### List Users
```http
GET /users

Response (200 OK):
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "user-1",
        "name": "Super Admin",
        "email": "admin@school.edu",
        "role": "superadmin"
      }
    ]
  }
}
```

### Get User Details
```http
GET /users/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-1",
      "name": "Super Admin",
      "email": "admin@school.edu",
      "role": "superadmin"
    }
  }
}
```

### Create User
```http
POST /users
Content-Type: application/json

Request Body:
{
  "name": "New Admin",
  "email": "newadmin@school.edu",
  "password": "password123",
  "role": "admin"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "user": {
      "id": "user-2",
      "name": "New Admin",
      "email": "newadmin@school.edu",
      "role": "admin"
    }
  }
}
```

### Update User
```http
PATCH /users/:id
Content-Type: application/json

Request Body:
{
  "name": "Updated Name",
  "email": "updated@school.edu",
  "password": "newpassword" // optional
}

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      // ... updated user object
    }
  }
}
```

### Delete User
```http
DELETE /users/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

---

## Settings - Configuration

### Get/Update Notification Settings
```http
GET /settings/notifications
POST /settings/notifications

POST Request Body:
{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "notifyOnAbsence": true,
  "notifyOnLateArrival": true,
  "notifyOnUnauthorizedAccess": true,
  "notifyOnCapacityAlert": true,
  "notifyOnSystemError": true,
  "emailRecipients": ["admin@school.edu"],
  "smsRecipients": ["+1234567890"]
}

Response (200 OK):
{
  "success": true,
  "data": {
    "config": {
      // ... configuration object
    }
  }
}
```

### Get/Update RFID Settings
```http
GET /settings/rfid
POST /settings/rfid

POST Request Body:
{
  "readerTimeout": 30,
  "autoCheckout": true,
  "checkoutDelay": 480,
  "duplicateReadDelay": 5,
  "enableVisitorMode": true,
  "maxDailyScans": 100
}
```

### Get/Update Security Settings
```http
GET /settings/security
POST /settings/security

POST Request Body:
{
  "sessionTimeout": 60,
  "requireMFA": false,
  "passwordExpiry": 90,
  "maxLoginAttempts": 5,
  "lockoutDuration": 30,
  "allowedIPs": []
}
```

### Get/Update System Settings
```http
GET /settings/system
POST /settings/system

POST Request Body:
{
  "schoolName": "Benedicto College",
  "timezone": "Asia/Manila",
  "dateFormat": "MM/DD/YYYY",
  "dataRetention": 365
}
```

---

## Error Response Format

All errors should follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Notes

1. **Authentication**: All endpoints (except `/auth/login`) require JWT token in `Authorization: Bearer <token>` header
2. **Date Format**: ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
3. **Pagination**: Default page size is 10
4. **Search**: Case-insensitive
5. **Real-time**: Frontend auto-refreshes data every 15-30 seconds

---

This reference covers all API endpoints the frontend expects. Make sure your backend implements these endpoints for full functionality!
