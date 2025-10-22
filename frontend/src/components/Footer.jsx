import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart
} from 'lucide-react';
import logo1 from '@/assets/logo1.png';

export function Footer() {
  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Medical Specialties', href: '#specialties' },
    { name: 'Find a Doctor', href: '#doctors' },
    { name: 'Careers', href: '#careers' },
    { name: 'Patient Portal', href: '#portal' },
  ];

  const patientResources = [
    { name: 'Book Appointment', href: '#book' },
    { name: 'Billing & Insurance', href: '#billing' },
    { name: 'Visitor Information', href: '#visitors' },
    { name: 'Medical Records', href: '#records' },
    { name: 'Patient Rights', href: '#rights' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/rkp.rajeev.1' },
    { name: 'Twitter', icon: Twitter, href: 'https://x.com/RajeevKP312?t=tGnPtyiMPI1m9VtPF8tJAA&s=09' },
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/veeraj030/' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/rajeev-kumar-pandit-a72977280' },
  ];

  return (
    <footer id="contact" className="bg-sky-100 border-t border-sky-200">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Hospital Branding */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src={logo1} 
                alt="HealthNexus Logo" 
                className="h-16 w-auto mr-3"
              />
              <span className="text-3xl font-bold text-success">HealthNexus</span>
            </div>
            <p className="text-gray-900 mb-6 leading-relaxed">
              Compassionate care, cutting-edge technology, and medical excellence 
              for over three decades. Your health is our priority.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary mr-3" />
                <span className="text-success">
                  123 Medical Center Blvd<br />
                  Healthcare City, HC 12345
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-3" />
                <span className="text-success">
                  +91 9876543210
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <span className="text-success">
                  info@healthnexus.com
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-900 hover:text-primary transition-colors"
                    onClick={(e) => {
                      if (link.name === 'About Us') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openAboutUs'));
                      } else if (link.name === 'Careers') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openCareers'));
                      } else if (link.name === 'Patient Portal') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { redirectTo: '/patient', defaultRole: 'patient' } }));
                      }
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">
              Patient Resources
            </h3>
            <ul className="space-y-2">
              {patientResources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    className="text-gray-900 hover:text-primary transition-colors"
                    onClick={(e) => {
                      if (resource.name === 'Patient Rights') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openPatientRights'));
                      } else if (resource.name === 'Billing & Insurance') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openBillingInsurance'));
                      } else if (resource.name === 'Visitor Information') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openVisitorInformation'));
                      } else if (resource.name === 'Medical Records') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openMedicalRecords'));
                      } else if (resource.name === 'Book Appointment') {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { redirectTo: '/patient/request-appointment', defaultRole: 'patient' } }));
                      }
                    }}
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & Emergency */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">
              Hours & Emergency
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span className="font-bold text-success">Hospital Hours</span>
                </div>
                <div className="text-sm text-gray-900 ml-8">
                  Mon - Fri: 6:00 AM - 10:00 PM<br />
                  Sat - Sun: 7:00 AM - 9:00 PM
                </div>
              </div>
              
              <div className="bg-emergency/10 rounded-lg p-4 border border-emergency/20">
                <div className="text-emergency font-semibold mb-1">
                  24/7 Emergency
                </div>
                <div className="text-sm text-gray-900">
                  Emergency department always opens
                </div>
                <div className="text-lg font-bold text-emergency mt-2">
                  +91 9999999999
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Bottom Section */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Media */}
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-success font-bold text-1xl">Follow Us:</span>
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted rounded-full p-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end text-gray-900">
                <span>© 2025 HealthNexus. Made By Rajeev Kuamr Pandit </span>
                <Heart className="h-4 w-4 text-red-500 mx-1" />
                <span> for better healthcare.</span>
              </div>
              <div className="text-sm text-gray-900 mt-1">
                Privacy Policy | Terms of Service 
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
