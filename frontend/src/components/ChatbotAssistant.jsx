import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Calendar, UserSearch, FileText, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export function ChatbotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const quickOptions = [
    {
      id: 'appointment',
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule with a specialist',
    },
    {
      id: 'doctor',
      icon: UserSearch,
      title: 'Find a Doctor',
      description: 'Search by specialty or name',
    },
    {
      id: 'reports',
      icon: FileText,
      title: 'View Lab Reports',
      description: 'Access your test results',
    },
    {
      id: 'emergency',
      icon: Phone,
      title: 'Emergency Help',
      description: 'Urgent medical assistance',
    },
  ];

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setSelectedOption(null);
    if (!isOpen) {
      // Initialize with welcome message when opening
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your HealthBot Assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  };

  const addMessage = (text, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.trim();
      addMessage(userMessage);
      setInputValue('');
      setIsLoading(true);
      
      try {
        // Send message to backend API
        const response = await axios.post('http://localhost:8000/api/chatbot/chat', {
          message: userMessage,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        });

        if (response.data.success) {
          addMessage(response.data.response, 'bot');
        } else {
          // Use fallback response if available
          const fallbackMessage = response.data.fallbackResponse || 
            "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
          addMessage(fallbackMessage, 'bot');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        let errorMessage =
          error.response?.data?.response ||
          error.response?.data?.fallbackResponse ||
          "I'm sorry, I'm having trouble connecting right now. Please try again later.";

        addMessage(errorMessage, 'bot');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleOptionSelect = async (optionId) => {
    const option = quickOptions.find(opt => opt.id === optionId);
    const userMessage = `I'd like to ${option.title.toLowerCase()}`;
    addMessage(userMessage);
    setSelectedOption(optionId);
    setIsLoading(true);
    
    try {
      // Send message to backend API
      const response = await axios.post('http://localhost:8000/api/chatbot/chat', {
        message: userMessage,
        conversationHistory: messages.slice(-10)
      });

      if (response.data.success) {
        addMessage(response.data.response, 'bot');
      } else {
        // Fallback responses for quick options
        let fallbackResponse = '';
        switch (optionId) {
          case 'appointment':
            fallbackResponse = "I'll help you book an appointment. What specialty do you need?";
            break;
          case 'doctor':
            fallbackResponse = "I'll help you find a doctor. What specialty are you looking for?";
            break;
          case 'reports':
            fallbackResponse = "I'll help you access your lab reports. Please provide your patient ID or date of birth for verification.";
            break;
          case 'emergency':
            fallbackResponse = "For immediate emergency assistance, please call +1 (555) EMERGENCY or visit your nearest emergency room.";
            break;
          default:
            fallbackResponse = "How can I assist you with this request?";
        }
        addMessage(fallbackResponse, 'bot');
      }
    } catch (error) {
      console.error('Error with option selection:', error);
      // Fallback to default responses if API fails
      let fallbackResponse = '';
      switch (optionId) {
        case 'appointment':
          fallbackResponse = "I'll help you book an appointment. What specialty do you need?";
          break;
        case 'doctor':
          fallbackResponse = "I'll help you find a doctor. What specialty are you looking for?";
          break;
        case 'reports':
          fallbackResponse = "I'll help you access your lab reports. Please provide your patient ID or date of birth for verification.";
          break;
        case 'emergency':
          fallbackResponse = "For immediate emergency assistance, please call +1 (555) EMERGENCY or visit your nearest emergency room.";
          break;
        default:
          fallbackResponse = "How can I assist you with this request?";
      }
      addMessage(fallbackResponse, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-lg w-80 max-h-96 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex-shrink-0 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-3">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">HealthBot Assistant</h3>
                  <p className="text-xs text-blue-100">How can I help you today?</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
              style={{ maxHeight: '280px' }}
            >
              {messages.length === 0 ? (
                // Quick Options (shown when no messages)
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Choose from these quick actions:
                  </p>
                  {quickOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left bg-white"
                      >
                        <div className={`rounded-lg p-2 mr-3 ${
                          option.id === 'emergency' 
                            ? 'bg-emergency/10 text-emergency' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {option.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Messages Display
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {message.sender === 'bot' ? (
                          <ReactMarkdown className="space-y-1">{message.text}</ReactMarkdown>
                        ) : (
                          <p>{message.text}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-sm p-3 text-sm max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">HealthBot is typing...</span>
                      </div>
                    </div>
                  </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            {messages.length > 0 && (
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-500 disabled:opacity-50"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - only show when no messages */}
          {messages.length === 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0">
              <p className="text-xs text-gray-500 text-center">
                Available 24/7 • Powered by HealthNexus AI
              </p>
            </div>
          )}
        </div>
      )}
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white rounded-full h-14 w-14 shadow-card animate-pulse-soft"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-8 w-8" />
        )}
      </Button>
    </div>
  );

}
