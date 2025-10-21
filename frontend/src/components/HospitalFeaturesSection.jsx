import { 
  Zap, 
  Calendar, 
  Video, 
  CreditCard, 
  FileText, 
  Pill, 
  TestTube,
  Phone,
  Shield,
  Clock,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function HospitalFeaturesSection() {
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const features = [
    {
      icon: Zap,
      title: '24/7 Emergency Care',
      description: 'Immediate medical attention when you need it most, with specialized trauma and critical care units.',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: Calendar,
      title: 'Online Appointment Booking',
      description: 'Schedule appointments with ease through our patient portal or mobile app, available 24/7.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Video,
      title: 'Telemedicine Consultations',
      description: 'Connect with healthcare providers from the comfort of your home via secure video calls.',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: CreditCard,
      title: 'Insurance & Billing Support',
      description: 'Dedicated team to help navigate insurance coverage and payment options for all services.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: FileText,
      title: 'Patient Portal & Medical Records',
      description: 'Secure access to your medical history, test results, and treatment plans anytime, anywhere.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
      icon: Pill,
      title: 'Pharmacy Services',
      description: 'On-site pharmacy with prescription delivery and medication management services.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: TestTube,
      title: 'Lab & Diagnostic Tests',
      description: 'State-of-the-art laboratory and imaging services with rapid result delivery.',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  const additionalServices = [
    {
      icon: Phone,
      title: 'Nurse Hotline',
      description: '24/7 medical advice',
    },
    {
      icon: Shield,
      title: 'Health Insurance',
      description: 'Coverage verification',
    },
    {
      icon: Clock,
      title: 'Same-Day Care',
      description: 'Urgent care services',
    },
    {
      icon: Wifi,
      title: 'Patient Wi-Fi',
      description: 'Free hospital internet',
    },
  ];

  return (
    <section id="features" className="py-8 bg-sky-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Hospital Features & Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience healthcare redefined with our comprehensive services, 
            advanced technology, and patient-centered amenities.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(showAllFeatures ? features : features.slice(0, 4)).map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s`  }}
              >
                <div className={`${feature.bgColor} rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300` }>
                  <IconComponent className={`h-6 w-6 ${feature.color}` } />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Show More Button */}
        {!showAllFeatures && features.length > 4 && (
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowAllFeatures(true)}
              size="lg"
              className="!bg-blue-500 !text-white hover:!bg-white hover:!text-blue-500 font-semibold px-8 py-4 text-lg rounded-xl border-2 !border-blue-500 hover:!border-blue-500 transition-all duration-200"
            >
              Show More Features ({features.length - 4} more)
            </Button>
          </div>
        )}

        {/* Show Less Button */}
        {showAllFeatures && (
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowAllFeatures(false)}
              variant="outline"
              size="lg"
              className="!bg-blue-500 !text-white hover:!bg-white hover:!text-blue-500 font-semibold px-8 py-4 text-lg rounded-xl border-2 !border-blue-500 hover:!border-blue-500 transition-all duration-200"
            >
              Show Less
            </Button>
          </div>
        )}

        {/* Additional Services Bar */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
            Additional Patient Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {additionalServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.title}
                  className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="bg-blue-50 rounded-lg p-2 mr-3 group-hover:bg-blue-100 transition-colors">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">
                      {service.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {service.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technology Showcase */}
        <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-blue-50 rounded-2xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Cutting-Edge Medical Technology
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            From advanced robotic surgery to AI-powered diagnostics, we leverage 
            the latest innovations to deliver precision healthcare.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">4K</div>
              <div className="text-sm text-gray-600">Surgical Imaging</div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">AI</div>
              <div className="text-sm text-gray-600">Diagnostics</div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">3T</div>
              <div className="text-sm text-gray-600">MRI Scanners</div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}