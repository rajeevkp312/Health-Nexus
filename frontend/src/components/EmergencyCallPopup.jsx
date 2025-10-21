import React, { useState } from 'react';
import { Phone, X, PhoneCall, Clock, MapPin, User, MapPin as Address } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmergencyCallPopup({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Calling
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.address) {
      setStep(2);
      // Simulate call after 2 seconds
      setTimeout(() => {
        alert(`Connecting to Hospital Reception...\n📞 +91-9876543210\n\nCaller Details:\nName: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}`);
      }, 2000);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({ name: '', phone: '', address: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-2 overflow-hidden animate-scale-in max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 rounded-full p-2">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Emergency Call</h2>
              <p className="text-red-100 text-xs">Hospital Reception</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {step === 1 ? (
            // Step 1: Form
            <>
              <div className="text-center mb-3">
                <div className="bg-red-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Phone className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  Emergency Call Request
                </h3>
                <p className="text-gray-600 text-xs">
                  Please provide your details for emergency assistance
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* Address Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                    placeholder="Enter your complete address"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg mt-3 text-sm"
                >
                  Proceed to Call
                </Button>
              </form>

              <Button
                onClick={resetAndClose}
                variant="outline"
                className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 py-2 rounded-lg mt-2 text-sm"
              >
                Cancel
              </Button>
            </>
          ) : (
            // Step 2: Calling Screen
            <>
              <div className="text-center mb-3">
                <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <PhoneCall className="h-8 w-8 text-red-500 animate-pulse" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  Connecting...
                </h3>
                <p className="text-gray-600 text-xs">
                  Calling HealthNexus Hospital Reception
                </p>
              </div>

              {/* Caller Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <h4 className="font-semibold text-black mb-2 text-sm">Caller Details:</h4>
                <div className="space-y-1 text-xs">
                  <div className="text-black"><strong className="text-black">Name:</strong> {formData.name}</div>
                  <div className="text-black"><strong className="text-black">Phone:</strong> {formData.phone}</div>
                  <div className="text-black"><strong className="text-black">Address:</strong> {formData.address}</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2 text-xs">
                  <Phone className="h-3 w-3 text-red-500" />
                  <span className="font-medium text-black">+91-9876543210</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Clock className="h-3 w-3 text-red-500" />
                  <span className="text-black">Available 24/7</span>
                </div>
              </div>

              <Button
                onClick={resetAndClose}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm"
              >
                End Call
              </Button>
            </>
          )}

          {/* Emergency Note */}
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> For life-threatening emergencies, call 108 immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
