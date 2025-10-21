import { 
  Brain, 
  Bone, 
  Baby, 
  Eye, 
  Stethoscope, 
  Zap, 
  Shield, 
  Users,
  Microscope,
  Ear,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SpecialtiesSection() {
  const [showAll, setShowAll] = useState(false);
  const specialties = [
    {
      icon: Brain,
      name: 'Neurology',
      description: 'Brain & nervous system',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      services: '12+ Services',
    },
    {
      icon: Bone,
      name: 'Orthopedics',
      description: 'Bones, joints & muscles',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      services: '18+ Services',
    },
    {
      icon: Baby,
      name: 'Pediatrics',
      description: 'Children\'s healthcare',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      services: '20+ Services',
    },
    {
      icon: Eye,
      name: 'Ophthalmology',
      description: 'Eye care & vision',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      services: '10+ Services',
    },
    {
      icon: Ear,
      name: 'ENT',
      description: 'Ear, nose & throat',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      services: '14+ Services',
    },
    {
      icon: Activity,
      name: 'Oncology',
      description: 'Cancer treatment & care',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      services: '25+ Services',
    },
    {
      icon: Shield,
      name: 'Dermatology',
      description: 'Skin & cosmetic care',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      services: '16+ Services',
    },
    {
      icon: Users,
      name: 'Psychiatry',
      description: 'Mental health & wellness',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      services: '8+ Services',
    },
    {
      icon: Stethoscope,
      name: 'Internal Medicine',
      description: 'General adult medicine',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      services: '22+ Services',
    },
    {
      icon: Zap,
      name: 'Emergency Care',
      description: '24/7 emergency services',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      services: 'Always Available',
    },
    {
      icon: Microscope,
      name: 'Pathology',
      description: 'Lab tests & diagnostics',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      services: '50+ Tests',
    },
  ];

  return (
    <section id="specialties" className="py-20 bg-sky-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Medical Specialties
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive healthcare services across all medical specialties with 
            state-of-the-art facilities and expert physicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {(showAll ? specialties : specialties.slice(0, 4)).map((specialty, index) => {
            const IconComponent = specialty.icon;
            return (
              <div
                key={specialty.name}
                className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 group"
                style={{ animationDelay: `${index * 0.05}s`  }}
              >
                <div className={`${specialty.bgColor} rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300` }>
                  <IconComponent className={`h-6 w-6 ${specialty.color}` } />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {specialty.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-2">
                  {specialty.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-600">
                    {specialty.services}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-200 hover:border-blue-600"
                  >
                    Explore
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* See More Button */}
        {!showAll && specialties.length > 4 && (
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowAll(true)}
              size="lg"
              className="!bg-green-500 !text-white hover:!bg-white hover:!text-green-500 font-semibold px-8 py-4 text-lg rounded-xl border-2 !border-green-500 hover:!border-green-500 transition-all duration-200"
            >
              See More Specialties ({specialties.length - 4} more)
            </Button>
          </div>
        )}

        {/* Show Less Button */}
        {showAll && (
          <div className="text-center mb-8">
            <Button 
              onClick={() => setShowAll(false)}
              variant="outline"
              size="lg"
              className="!bg-green-500 !text-white hover:!bg-white hover:!text-green-500 font-semibold px-8 py-4 text-lg rounded-xl border-2 !border-green-500 hover:!border-green-500 transition-all duration-200"
            >
              Show Less
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
