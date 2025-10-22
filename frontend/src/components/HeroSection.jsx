import { Calendar, Search, Phone, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { EmergencyCallPopup } from './EmergencyCallPopup';
import { BookAppointmentPopup } from './BookAppointmentPopup';
import { FindDoctorPopup } from './FindDoctorPopup';
import { NewsTicker } from './NewsTicker';
import logo2 from '@/assets/logo2.png';
import bg21 from '@/assets/bg21.png';
import bg1 from '@/assets/bg1.png';
import bg3 from '@/assets/bg3.png';

export function HeroSection({ onLoginClick, onBookAppointmentClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEmergencyPopupOpen, setIsEmergencyPopupOpen] = useState(false);
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState(false);
  const [isFindDoctorOpen, setIsFindDoctorOpen] = useState(false);
  const heroImages = [
    bg21,
    bg1,
    bg3
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section id="home" className="relative h-[100vh] sm:h-[80vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <img 
                src={logo2}
                alt="HealthNexus Logo" 
                className="h-12 w-auto mr-2"
              />
              <span className="text-xl md:text-2xl font-bold text-white">HealthNexus</span>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              <a href="#home" className="text-white hover:text-blue-200 transition-colors duration-300 cursor-pointer">Home</a>
              <a href="#features" className="text-white hover:text-blue-200 transition-colors duration-300 cursor-pointer">Services</a>
              <a href="#specialties" className="text-white hover:text-blue-200 transition-colors duration-300 cursor-pointer">Specialties</a>
              <a href="#doctors" className="text-white hover:text-blue-200 transition-colors duration-300 cursor-pointer">Doctors</a>
              <a href="#contact" className="text-white hover:text-blue-200 transition-colors duration-300 cursor-pointer">Contact</a>
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button 
                onClick={() => setIsEmergencyPopupOpen(true)}
                className="text-white hover:text-blue-200 transition-colors flex items-center font-semibold drop-shadow-md text-sm lg:text-base"
              >
                <Phone className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Emergency</span>
                <span className="lg:hidden">SOS</span>
              </button>
              <button 
                onClick={onLoginClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors font-semibold shadow-lg text-sm lg:text-base"
              >
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button 
                onClick={() => setIsEmergencyPopupOpen(true)}
                className="text-white hover:text-blue-200 transition-colors p-2 bg-red-600/20 rounded-lg hover:bg-red-600/30"
                aria-label="Emergency Call"
              >
                <Phone className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-blue-200 transition-colors p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 bg-black/90 backdrop-blur-md rounded-lg p-6 shadow-xl">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#home" 
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a 
                  href="#features" 
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a 
                  href="#specialties" 
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Specialties
                </a>
                <a 
                  href="#doctors" 
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Doctors
                </a>
                <a 
                  href="#contact" 
                  className="text-white hover:text-blue-200 transition-colors cursor-pointer py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <button 
                  onClick={() => {
                    setIsEmergencyPopupOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg text-left flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Call
                </button>
                <button 
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg text-left"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Animated Background Images */}
      {heroImages.map((image, index) => (
        <div 
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})` ,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/85 to-teal-900/90" />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto py-8 sm:py-12 md:py-20">
        <div className="animate-slide-up">
          
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight animate-slide-up hero-title">
            <span className="text-white drop-shadow-lg hero-lead">Your Health,</span>{' '}
            <span id="heroPriority" className="block drop-shadow-lg font-extrabold hero-priority" style={{color: '#FBBF24'}}>
              Our Priority
            </span>
          </h1>
          
          <p id="heroParagraph" className="text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in drop-shadow-md text-white hero-paragraph">
            World-class healthcare with compassionate care, cutting-edge technology, 
            and medical excellence that puts patients first.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in">
            <Button 
              onClick={() => {
                if (typeof onBookAppointmentClick === 'function') {
                  onBookAppointmentClick();
                } else {
                  setIsBookAppointmentOpen(true);
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-glow text-sm sm:text-base w-full sm:w-auto"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Book Appointment
            </Button>
            <Button 
              onClick={() => setIsFindDoctorOpen(true)}
              variant="outline" 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-glow text-sm sm:text-base w-full sm:w-auto"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Find a Doctor
            </Button>
          </div>

        </div>
      </div>

      {/* News Ticker - At the very bottom over background, full width */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full">
        <NewsTicker />
      </div>


      {/* Emergency Call Popup */}
      <EmergencyCallPopup 
        isOpen={isEmergencyPopupOpen} 
        onClose={() => setIsEmergencyPopupOpen(false)} 
      />

      {/* Book Appointment Popup */}
      <BookAppointmentPopup 
        isOpen={isBookAppointmentOpen} 
        onClose={() => setIsBookAppointmentOpen(false)} 
      />

      {/* Find Doctor Popup */}
      <FindDoctorPopup 
        isOpen={isFindDoctorOpen} 
        onClose={() => setIsFindDoctorOpen(false)} 
      />
    </section>
  );
}
