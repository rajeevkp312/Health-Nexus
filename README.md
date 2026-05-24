# HealthNexus

A comprehensive healthcare management system built with React, Express, and MongoDB. HealthNexus provides a complete solution for managing doctors, patients, appointments, news, and health-related content with an integrated AI chatbot.

## 🌟 Features

- **Admin Dashboard**: Comprehensive management interface for administrators
- **Doctor Management**: Add, update, and manage doctor profiles with specialties and availability
- **Patient Management**: Complete patient registration and health records management
- **Appointment System**: Book and manage appointments with doctors
- **News & Articles**: Health-related content management with categories
- **AI Chatbot**: Integrated AI-powered health assistant using OpenAI
- **Feedback System**: Collect and manage patient feedback
- **Real-time Updates**: Server-sent events for live activity streams
- **Secure Authentication**: JWT-based authentication for all user types

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File uploads
- **OpenAI** - AI chatbot integration
- **SendGrid/Resend** - Email services
- **Nodemailer** - Email sending

## 📁 Project Structure

```
healthNexus7/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── Admin/           # Admin dashboard components
│   │   ├── Doctor/          # Doctor portal components
│   │   ├── Patient/         # Patient portal components
│   │   ├── Pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utility functions
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Express backend API
│   ├── Model/               # Mongoose models
│   ├── Route/               # API routes
│   ├── middleware/          # Custom middleware
│   ├── uploads/             # Uploaded files
│   ├── index.js             # Entry point
│   ├── .env.example         # Environment variables template
│   └── API_DOCUMENTATION.md # Detailed API docs
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd healthNexus7
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Create a `.env` file in the `backend` directory based on `.env.example`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=8000

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/healthnexus7
DB_NAME=healthnexus7

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

### Running the Application

1. **Start MongoDB**
```bash
# If using local MongoDB
mongod
# Or ensure MongoDB service is running
```

2. **Start Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:8000
```

3. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔐 Default Credentials

### Admin
- **Email**: admin@gmail.com
- **Password**: admin123

### Sample Doctor
- **Email**: sarah.wilson@healthnexus.com
- **Password**: doctor123

### Sample Patient
- **Email**: john.smith@email.com
- **Password**: patient123

## 📡 API Endpoints

The backend API runs on `http://localhost:8000` with the following main routes:

### Admin Routes
- `POST /api/admin/log` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/doctors` - Get all doctors
- `POST /api/admin/add-doctor` - Add new doctor
- `PUT /api/admin/doctor/:id` - Update doctor
- `DELETE /api/admin/doctor/:id` - Delete doctor
- `GET /api/admin/patients` - Get all patients
- `POST /api/admin/add-patient` - Add new patient
- `PUT /api/admin/patient/:id` - Update patient
- `DELETE /api/admin/patient/:id` - Delete patient
- `GET /api/admin/appointments` - Get all appointments
- `PUT /api/admin/appointment/:id` - Update appointment status
- `GET /api/admin/news` - Get all news
- `POST /api/admin/news` - Add news article
- `PUT /api/admin/news/:id` - Update news article
- `DELETE /api/admin/news/:id` - Delete news article
- `GET /api/admin/feedback` - Get all feedback
- `GET /api/admin/enquiries` - Get enquiries

### Doctor Routes
- `POST /api/doctor/log` - Doctor login
- `GET /api/doctor` - Get all doctors (public)
- `GET /api/doctor/:id` - Get doctor by ID
- `GET /api/doctor/stats/:id` - Get doctor statistics

### Patient Routes
- `POST /api/patient` - Patient registration/login

### Other Routes
- `/api/app` - Appointment management
- `/api/news` - News articles
- `/api/feed` - Feed management
- `/api/chatbot` - AI chatbot
- `/api/auth` - Authentication
- `/api/reports` - Reports

For detailed API documentation, see `backend/API_DOCUMENTATION.md`

## 🎨 Frontend Features

### Admin Dashboard
- Overview statistics
- Doctor management (CRUD operations)
- Patient management (CRUD operations)
- Appointment scheduling and management
- News and article publishing
- Feedback and enquiry management
- Real-time activity stream

### Doctor Portal
- Profile management
- Appointment viewing
- Patient information access
- Statistics dashboard

### Patient Portal
- Profile management
- Appointment booking
- Doctor browsing
- Health news access
- AI chatbot assistance

## 🔧 Configuration

### MongoDB Connection
The backend connects to MongoDB using the connection string from the `.env` file. Default database name is `healthnexus7`.

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- `http://localhost:3000`

You can customize this by setting the `CORS_ORIGINS` environment variable.

### File Uploads
- Supported formats: JPG, JPEG, PNG, GIF
- Maximum file size: 5MB
- Uploads are stored in `backend/uploads/`
- Accessible via `/uploads/filename`

## 🧪 Development

### Backend Scripts
```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
```

### Frontend Scripts
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
npm run preview # Preview production build
```

## 📦 Database Schema

### Doctor Model
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

### Patient Model
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

### Appointment Model
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

### News Model
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

## 🔒 Security Features

- JWT-based authentication
- CORS configuration
- Input validation
- File upload restrictions
- Environment variable configuration
- Password hashing with bcrypt

## 🚀 Production Deployment

### Backend
1. Set production environment variables
2. Build and start the server:
```bash
cd backend
npm start
```

### Frontend
1. Build the application:
```bash
cd frontend
npm run build
```
2. Deploy the `dist` folder to your hosting service

### Environment Variables for Production
- Use strong JWT_SECRET
- Configure production MongoDB URI
- Set up proper email credentials
- Configure CORS origins for production domain
- Use HTTPS

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please contact the development team or open an issue in the repository.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for comprehensive healthcare management solutions
- AI-powered features powered by OpenAI
