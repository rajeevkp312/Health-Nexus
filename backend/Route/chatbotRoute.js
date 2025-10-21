const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

const EFFECTIVE_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const IS_OPENROUTER = !!EFFECTIVE_API_KEY && EFFECTIVE_API_KEY.startsWith('sk-or-');

const openai = new OpenAI({
  apiKey: EFFECTIVE_API_KEY,
  baseURL: IS_OPENROUTER ? 'https://openrouter.ai/api/v1' : undefined,
});

console.log('HealthBot provider:', IS_OPENROUTER ? 'OpenRouter' : (EFFECTIVE_API_KEY ? 'OpenAI' : 'NONE'));
console.log('HealthBot baseURL:', IS_OPENROUTER ? 'https://openrouter.ai/api/v1' : 'OpenAI default');

// System prompt for the healthcare chatbot
const SYSTEM_PROMPT = `You are HealthBot, an AI assistant for HealthNexus, a comprehensive healthcare management system. You are helpful, professional, and knowledgeable about healthcare topics while being careful not to provide specific medical diagnoses or treatment recommendations.

Your capabilities include:
- Helping users book appointments
- Finding doctors by specialty
- Providing general health information and wellness tips
- Assisting with navigation of the HealthNexus platform
- Answering questions about lab reports and medical records
- Providing emergency contact information
- General healthcare guidance and preventive care information

Important guidelines:
- Always recommend consulting with healthcare professionals for specific medical concerns
- Provide helpful, accurate, and empathetic responses
- Keep responses concise but informative
- If asked about emergencies, always direct to emergency services
- Stay within the scope of general health information and platform assistance
- Be supportive and understanding of health concerns

Remember: You are part of the HealthNexus ecosystem, so you can help users navigate the platform and its features.`;

// Fallback responses for when OpenAI is not available
const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
    return "I'd be happy to help you book an appointment! To schedule an appointment, please:\n\n1. Choose your preferred specialty\n2. Select an available doctor\n3. Pick a convenient time slot\n\nYou can also call our booking line at (555) 123-HEALTH for immediate assistance.";
  }
  
  if (lowerMessage.includes('doctor') || lowerMessage.includes('find')) {
    return "I can help you find the right doctor! Our HealthNexus platform has specialists in:\n\n• Cardiology\n• Dermatology\n• Pediatrics\n• Orthopedics\n• Internal Medicine\n• And many more!\n\nWhat specialty are you looking for?";
  }
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
    return "🚨 For immediate emergency assistance:\n\n• Call 911 for life-threatening emergencies\n• Visit your nearest emergency room\n• Call our emergency line: (555) EMERGENCY\n\nIf this is not an emergency, I'm here to help with other health-related questions.";
  }
  
  if (lowerMessage.includes('report') || lowerMessage.includes('lab') || lowerMessage.includes('test')) {
    return "To access your lab reports and test results:\n\n1. Log into your HealthNexus patient portal\n2. Navigate to 'My Reports' section\n3. View or download your results\n\nIf you need help interpreting your results, please consult with your healthcare provider.";
  }
  
  if (lowerMessage.includes('health') || lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
    return "Here are some general health tips:\n\n• Stay hydrated (8 glasses of water daily)\n• Get regular exercise (30 minutes, 5 days a week)\n• Eat a balanced diet with fruits and vegetables\n• Get adequate sleep (7-9 hours nightly)\n• Schedule regular check-ups\n\nRemember: Always consult your healthcare provider for personalized medical advice!";
  }
  
  return "Thank you for your message! I'm here to help with:\n\n• Booking appointments\n• Finding doctors\n• Accessing lab reports\n• General health information\n• Emergency assistance\n\nHow can I assist you today? For complex medical questions, please consult with a healthcare professional.";
};

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    console.log('Received chat message:', message);

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string'
      });
    }

    // Check if any API key is available
    if (!EFFECTIVE_API_KEY) {
      console.log('API key not found, using fallback response');
      return res.json({
        success: true,
        response: getFallbackResponse(message),
        fallback: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('API key found, attempting API call...');

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    // Choose model per provider
    const model = IS_OPENROUTER
      ? (process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528:free')
      : (process.env.OPENAI_MODEL || 'gpt-3.5-turbo');
    console.log('Using model:', model, 'Provider:', IS_OPENROUTER ? 'OpenRouter' : 'OpenAI');
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    console.log('API call successful, got response');
    const botResponse = completion.choices[0].message.content;

    res.json({
      success: true,
      response: botResponse,
      provider: IS_OPENROUTER ? 'OpenRouter' : 'OpenAI',
      model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status,
      response: error.response?.data
    });
    
    // Use fallback response for any OpenAI error
    console.log('OpenAI API failed, using fallback response for message:', message);
    
    return res.json({
      success: true,
      response: getFallbackResponse(message),
      fallback: true,
      error_info: `OpenAI unavailable: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check for chatbot service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'HealthBot',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check environment variables
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    debug: {
      hasApiKey: !!EFFECTIVE_API_KEY,
      provider: IS_OPENROUTER ? 'OpenRouter' : (EFFECTIVE_API_KEY ? 'OpenAI' : 'NONE'),
      model: IS_OPENROUTER ? (process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528:free') : (process.env.OPENAI_MODEL || 'gpt-3.5-turbo'),
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    }
  });
});

// Test API connection
router.get('/test', async (req, res) => {
  try {
    const model = IS_OPENROUTER
      ? (process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528:free')
      : (process.env.OPENAI_MODEL || 'gpt-3.5-turbo');
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: 'Say "Hello, I am working!" in exactly those words.' }],
      max_tokens: 50,
      temperature: 0,
    });

    res.json({
      success: true,
      message: 'API connection successful',
      response: completion.choices[0].message.content,
      model: model,
      provider: IS_OPENROUTER ? 'OpenRouter' : 'OpenAI'
    });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      type: error.type,
      provider: IS_OPENROUTER ? 'OpenRouter' : 'OpenAI'
    });
  }
});

// Get chatbot capabilities
router.get('/capabilities', (req, res) => {
  res.json({
    success: true,
    capabilities: [
      {
        id: 'appointment',
        title: 'Book Appointment',
        description: 'Schedule with a specialist',
        example: 'I need to book an appointment with a cardiologist'
      },
      {
        id: 'doctor',
        title: 'Find a Doctor',
        description: 'Search by specialty or name',
        example: 'Can you help me find a dermatologist?'
      },
      {
        id: 'reports',
        title: 'Lab Reports',
        description: 'Access your test results',
        example: 'How do I access my recent blood test results?'
      },
      {
        id: 'emergency',
        title: 'Emergency Help',
        description: 'Urgent medical assistance',
        example: 'I need emergency medical help'
      },
      {
        id: 'general',
        title: 'Health Information',
        description: 'General health and wellness guidance',
        example: 'What are some tips for maintaining good heart health?'
      }
    ]
  });
});

module.exports = router;
