# 🤖 HealthNexus Chatbot Integration

## Overview
The HealthNexus chatbot is now fully functional with OpenAI GPT-3.5-turbo integration. It provides intelligent healthcare assistance and platform navigation support.

## 🚀 Features
- **AI-Powered Responses**: Uses OpenAI GPT-3.5-turbo for natural language understanding
- **Healthcare Context**: Specialized prompts for medical and healthcare scenarios
- **Quick Actions**: Pre-defined buttons for common tasks
- **Conversation History**: Maintains context across messages
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Loading States**: Visual feedback during API calls

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=8000
   MONGODB_URI=mongodb://127.0.0.1:27017/healthnexus7
   ```

### 3. Start the Backend Server
```bash
cd backend
npm start
```

### 4. Start the Frontend
```bash
cd frontend
npm run dev
```

## 🧪 Testing

### Option 1: Use the Test Page
1. Open `test-chatbot.html` in your browser
2. Ensure the backend server is running
3. Try the quick actions or type custom messages

### Option 2: Use the Main Application
1. Visit the main HealthNexus application
2. Click the floating chat button in the bottom-right corner
3. Interact with the chatbot

## 📡 API Endpoints

### Chat Endpoint
- **URL**: `POST /api/chatbot/chat`
- **Body**:
  ```json
  {
    "message": "I need help booking an appointment",
    "conversationHistory": [...]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "response": "I'll help you book an appointment...",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

### Health Check
- **URL**: `GET /api/chatbot/health`
- **Response**:
  ```json
  {
    "success": true,
    "service": "HealthBot",
    "status": "operational",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

### Capabilities
- **URL**: `GET /api/chatbot/capabilities`
- **Response**: Lists available chatbot capabilities and examples

## 🎯 Chatbot Capabilities

The HealthBot can assist with:

1. **📅 Appointment Booking**
   - Help schedule appointments with specialists
   - Provide available time slots information
   - Guide through booking process

2. **👨‍⚕️ Doctor Search**
   - Find doctors by specialty
   - Provide doctor information and availability
   - Suggest appropriate specialists

3. **📋 Lab Reports**
   - Guide users to access test results
   - Explain how to interpret basic values
   - Direct to appropriate medical professionals

4. **🚨 Emergency Assistance**
   - Provide emergency contact information
   - Direct to appropriate emergency services
   - Offer immediate guidance for urgent situations

5. **💡 Health Information**
   - General health and wellness tips
   - Preventive care information
   - Basic medical education

## 🔧 Customization

### Modifying the System Prompt
Edit the `SYSTEM_PROMPT` in `backend/Route/chatbotRoute.js` to customize the chatbot's behavior and knowledge base.

### Adding New Quick Actions
Update the `quickOptions` array in `frontend/src/components/ChatbotAssistant.jsx` to add new quick action buttons.

### Styling
The chatbot uses Tailwind CSS classes. Modify the component styles in `ChatbotAssistant.jsx` to match your design requirements.

## 🛡️ Error Handling

The chatbot includes comprehensive error handling:
- **API Key Issues**: Graceful fallback responses
- **Network Errors**: Retry mechanisms and user feedback
- **Rate Limiting**: Appropriate error messages
- **Server Downtime**: Fallback to pre-defined responses

## 🔒 Security Considerations

- ✅ API key stored in environment variables
- ✅ Input validation on backend
- ✅ Rate limiting considerations
- ✅ Error message sanitization
- ✅ No sensitive data logged

## 📊 Monitoring

Monitor chatbot performance through:
- Backend console logs
- API response times
- Error rates
- User interaction patterns

## 🚨 Troubleshooting

### Common Issues

1. **"API quota exceeded"**
   - Check your OpenAI account usage
   - Verify billing information
   - Consider upgrading your plan

2. **"Invalid API key"**
   - Verify the API key in `.env` file
   - Ensure no extra spaces or characters
   - Check if the key is active

3. **"Connection error"**
   - Ensure backend server is running
   - Check if port 8000 is available
   - Verify CORS configuration

4. **Chatbot not responding**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Test with the provided test page

## 📈 Future Enhancements

Potential improvements:
- Voice input/output capabilities
- Multi-language support
- Integration with patient records
- Appointment booking automation
- Symptom checker functionality
- Medication reminders

---

**Note**: This chatbot is designed for general assistance and information. It should not be used as a substitute for professional medical advice, diagnosis, or treatment.
