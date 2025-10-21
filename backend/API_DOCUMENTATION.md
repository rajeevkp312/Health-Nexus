# HealthNexus API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
Most admin endpoints require authentication. Use the admin login endpoint to authenticate.

## Admin Endpoints

### Authentication
```http
POST /api/admin/log
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

### Dashboard Statistics
```http
GET /api/admin/stats
```
Returns comprehensive statistics for the admin dashboard.

## Doctor Management

### Get All Doctors
```http
GET /api/admin/doctors
```

### Add New Doctor
```http
POST /api/admin/add-doctor
Content-Type: multipart/form-data

Fields:
- name (required)
- email (required)
- phone (required)
- specialty (required)
- qualification (required)
- experience (required)
- gender
- address
- consultationFee
- availableDays (JSON array)
- availableTime
- bio
- image (file upload)
```

### Update Doctor
```http
PUT /api/admin/doctor/:id
Content-Type: multipart/form-data

Same fields as add doctor
```

### Delete Doctor
```http
DELETE /api/admin/doctor/:id
```

## Patient Management

### Get All Patients
```http
GET /api/admin/patients
```

### Add New Patient
```http
POST /api/admin/add-patient
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "+1234567890",
  "age": 30,
  "gender": "Male",
  "bloodGroup": "O+",
  "address": "123 Main St",
  "condition": "Hypertension",
  "status": "Active"
}
```

### Update Patient
```http
PUT /api/admin/patient/:id
Content-Type: application/json

Same fields as add patient
```

### Delete Patient
```http
DELETE /api/admin/patient/:id
```

## Appointment Management

### Get All Appointments
```http
GET /api/admin/appointments
```
Returns appointments with populated doctor and patient information.

### Update Appointment Status
```http
PUT /api/admin/appointment/:id
Content-Type: application/json

{
  "status": "Confirmed" // Scheduled, Confirmed, Cancelled, Completed
}
```

## News Management

### Get All News
```http
GET /api/admin/news
```

### Add News Article
```http
POST /api/admin/news
Content-Type: multipart/form-data

Fields:
- title (required)
- content (required)
- category (required) // Health Tips, Medical Research, Hospital News, Community Health, Technology
- author (required)
- status // draft, published, archived
- image (file upload)
```

### Update News Article
```http
PUT /api/admin/news/:id
Content-Type: multipart/form-data

Same fields as add news
```

### Delete News Article
```http
DELETE /api/admin/news/:id
```

## Feedback & Communication

### Get All Feedback
```http
GET /api/admin/feedback
```

### Get Enquiries
```http
GET /api/admin/enquiries
```

### Update Feedback Status
```http
PUT /api/admin/feedback/:id
Content-Type: application/json

{
  "status": "read"
}
```

## Doctor Endpoints

### Doctor Login
```http
POST /api/doctor/log
Content-Type: application/json

{
  "email": "doctor@email.com",
  "password": "doctor123"
}
```

### Get All Doctors (Public)
```http
GET /api/doctor
```

### Get Doctor by ID
```http
GET /api/doctor/:id
```

### Get Doctor Statistics
```http
GET /api/doctor/stats/:id
```

## Patient Endpoints

### Patient Registration/Login
```http
POST /api/patient
Content-Type: application/json

{
  "name": "Patient Name",
  "email": "patient@email.com",
  "password": "password123",
  "phone": "+1234567890",
  "age": 25,
  "gender": "Female",
  "bloodGroup": "A+",
  "address": "Patient Address"
}
```

## File Upload

### Supported File Types
- Images: JPG, JPEG, PNG, GIF
- Maximum file size: 5MB

### File Access
Uploaded files are accessible at:
```
http://localhost:8000/uploads/filename
```

## Error Responses

All endpoints return errors in the following format:
```json
{
  "msg": "Error message",
  "error": "Detailed error description"
}
```

## Success Responses

Successful operations return:
```json
{
  "msg": "Success",
  "data": {...}
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Sample Data

The system includes sample data that can be seeded using:
```bash
node seedData.js
```

### Default Login Credentials

**Admin:**
- Email: admin@gmail.com
- Password: admin123

**Sample Doctor:**
- Email: sarah.wilson@healthnexus.com
- Password: doctor123

**Sample Patient:**
- Email: john.smith@email.com
- Password: patient123

## Database Schema

### Doctor Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required, unique),
  specialty: String (required),
  qualification: String (required),
  experience: String (required),
  gender: String,
  address: String,
  consultationFee: Number (default: 150),
  availableDays: [String] (default: weekdays),
  availableTime: String (default: "9:00 AM - 5:00 PM"),
  bio: String,
  image: String,
  status: String (enum: active, inactive, pending)
}
```

### Patient Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  age: Number (required),
  gender: String (required),
  bloodGroup: String (required),
  address: String (required),
  condition: String (default: "General Checkup"),
  lastVisit: Date (default: now),
  status: String (enum: Active, Inactive, Critical, Recovered)
}
```

### Appointment Schema
```javascript
{
  pid: ObjectId (ref: patient),
  did: ObjectId (ref: doctor),
  patientName: String,
  patientEmail: String,
  patientPhone: String,
  doctorName: String,
  specialty: String,
  date: Date (required),
  time: String (required),
  reason: String (required),
  notes: String,
  status: String (enum: Scheduled, Confirmed, Cancelled, Completed)
}
```

### News Schema
```javascript
{
  title: String (required),
  content: String (required),
  category: String (required),
  author: String (required),
  image: String,
  publishDate: Date (default: now),
  views: Number (default: 0),
  status: String (enum: draft, published, archived)
}
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB service

3. Seed the database:
```bash
node seedData.js
```

4. Start the server:
```bash
npm start
# or
nodemon index.js
```

5. Server will run on http://localhost:8000

## Production Considerations

- Add proper authentication middleware
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for configuration
- Add logging and monitoring
- Implement proper error handling
- Add API versioning
- Use HTTPS in production
- Add database indexing for performance
- Implement backup strategies
