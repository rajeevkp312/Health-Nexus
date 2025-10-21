## HealthNexus Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Git

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/healthnexus7
     OPENAI_API_KEY=your_openai_api_key_here
     JWT_SECRET=healthnexus_jwt_secret_key_2024_secure
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_password_here
     ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Authentication System Setup

### Email Configuration (Gmail)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### Testing the Auth System
1. **Backend server must be running** on port 8000
2. **Frontend must be running** on port 5173
3. **Look for "Auth System Test"** component in bottom-left corner
4. **Try registering a new patient account**
5. **Check your email for OTP verification**

## Database Setup

1. **Ensure MongoDB is running:**
   - Start MongoDB service on your system
   - Default connection: `mongodb://127.0.0.1:27017/healthnexus7`

2. **Database will be created automatically** when the application starts

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:5173/admin

## Authentication Features

### New Auth System
- **Patient Registration:** Complete registration with email verification
- **Login System:** Role-based login (Patient/Doctor)
- **Password Reset:** OTP-based password recovery
- **Email Verification:** 6-digit OTP system
- **Remember Me:** Extended session duration

### API Endpoints
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset with OTP

## Default Credentials

### Admin Access
- **Email:** admin@healthnexus.com
- **Password:** admin123
- **RESTful APIs** for all CRUD operations
- **File Upload Support** with multer for images
- **Database Models** for doctors, patients, appointments, news, feedback
- **Authentication System** for admin and user login
- **Data Validation** and error handling
- **Sample Data Seeding** for quick setup
- **API Documentation** with all endpoints

## 🗄️ Database Structure

### Collections Created:
- **doctors** - Medical staff profiles and information
- **patients** - Patient records and medical history
- **apps** - Appointment scheduling and management
- **news** - Health articles and hospital news
- **admins** - Administrative user accounts
- **feeds** - Feedback, suggestions, and complaints

### Sample Data Included:
- 3 Sample doctors with different specialties
- 3 Sample patients with various conditions
- 2 Sample appointments with different statuses
- 3 Sample news articles in different categories
- 1 Admin account for dashboard access
- 3 Sample feedback entries

## 🎨 Design System

### Color Scheme
- **Primary**: Blue (#3B82F6) to Teal (#14B8A6) gradients
- **Secondary**: Gray tones for text and backgrounds
- **Accent**: Green for success, Red for errors, Yellow for warnings

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable font with proper spacing
- **UI Elements**: Consistent sizing and spacing

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Intuitive sidebar and header navigation

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

All components are fully responsive and touch-friendly.

## 🔧 API Integration

### Frontend to Backend Connection
- All admin forms connect to backend APIs
- Real-time data fetching and updates
- Error handling with user-friendly messages
- Loading states for better UX

### File Upload System
- Image uploads for doctor profiles
- News article featured images
- Secure file storage in uploads directory
- File type validation and size limits

## 📊 Admin Dashboard Capabilities

### Dashboard Overview
- **Statistics Cards**: Live counts of doctors, patients, appointments
- **Recent Activity**: Latest system activities and updates
- **Quick Actions**: Fast access to common tasks
- **System Status**: Monitor database and API health

### Doctor Management
- **Add Doctors**: Complete form with image upload
- **View All**: Grid and list views with search/filter
- **Edit Profiles**: Update doctor information and availability
- **Manage Specialties**: Organize by medical specialties
- **Availability**: Set working days and hours

### Patient Management
- **Patient Database**: Comprehensive patient records
- **Status Tracking**: Active, Critical, Recovered, Inactive
- **Medical History**: Track conditions and treatments
- **Contact Management**: Phone, email, address information

### Appointment System
- **View All Appointments**: Comprehensive appointment listing
- **Status Management**: Scheduled → Confirmed → Completed
- **Doctor-Patient Matching**: Link appointments to providers
- **Time Management**: Schedule and reschedule appointments

### Content Management
- **Create Articles**: Rich content creation for health news
- **Category Organization**: Health Tips, Research, Hospital News
- **Publishing Workflow**: Draft → Review → Publish
- **Media Management**: Upload and manage article images

## 🚀 Deployment Ready Features

### Production Considerations
- Environment variable support ready
- Database connection configuration
- Static file serving for uploads
- CORS configuration for cross-origin requests
- Error handling and logging setup

### Security Features
- Input validation on all forms
- File upload restrictions
- Authentication middleware ready
- SQL injection prevention with MongoDB
- XSS protection with proper data handling

## 🔄 Development Workflow

### Backend Development
```bash
# Start with auto-reload
nodemon index.js

# Test API endpoints
curl http://localhost:8000/health

# Reseed database when needed
node seedData.js
```

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📞 Support & Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB service is running
- Check connection string in index.js
- Verify database name matches

**Port Already in Use**
- Backend: Change port in index.js (default: 8000)
- Frontend: Change port in vite.config.js (default: 5173)

**File Upload Issues**
- Ensure uploads directory exists in backend
- Check file permissions
- Verify multer configuration

**API Connection Issues**
- Check CORS configuration
- Verify API endpoints in frontend
- Ensure backend server is running

### Development Tips
- Use browser dev tools for debugging
- Check console for error messages
- Monitor network tab for API calls
- Use MongoDB Compass for database inspection

## 🎯 Next Steps & Extensions

### Potential Enhancements
- **Real-time Notifications** with WebSockets
- **Advanced Analytics** with charts and graphs
- **Email Integration** for appointment confirmations
- **SMS Notifications** for appointment reminders
- **Payment Integration** for consultation fees
- **Video Consultation** capabilities
- **Mobile App** development
- **Multi-language Support**
- **Advanced Search** with filters and sorting
- **Report Generation** with PDF export

### Scalability Considerations
- **Database Indexing** for performance
- **Caching Layer** with Redis
- **Load Balancing** for high traffic
- **CDN Integration** for static assets
- **Microservices Architecture** for large scale
- **Container Deployment** with Docker
- **Cloud Hosting** setup guides

## 📈 Success Metrics

Your HealthNexus system is now equipped with:
- ✅ Complete admin dashboard with all CRUD operations
- ✅ Modern, responsive frontend matching your design
- ✅ Comprehensive backend API with all endpoints
- ✅ File upload system for images
- ✅ Sample data for immediate testing
- ✅ Mobile-friendly interface
- ✅ Production-ready architecture
- ✅ Comprehensive documentation

The system is ready for immediate use and can be easily extended with additional features as your healthcare organization grows!
