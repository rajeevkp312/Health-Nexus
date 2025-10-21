import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, User, Mail, Phone, Lock, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginModal({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Dummy credentials
  const dummyUsers = [
    { email: 'patient@demo.com', password: 'demo123', role: 'Patient' },
    { email: 'doctor@demo.com', password: 'demo123', role: 'Doctor' },
    { email: 'admin@demo.com', password: 'admin123', role: 'Admin' }
  ];

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user = dummyUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      toast({
        title: "Login Successful! 🎉",
        description: `Welcome back, ${user.role}! You have been logged in successfully.` ,
      });
      onClose();
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try: patient@demo.com / demo123",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (data) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Registration Successful! 🎉",
      description: `Welcome ${data.name}! Your account has been created successfully.` ,
    });
    
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <img 
              src="/src/assets/logo2.png" 
              alt="HealthNexus Logo" 
              className="h-10 w-auto"
            />
            HealthNexus Portal
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleLogin(
                formData.get('email'),
                formData.get('password')
              );
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-20 relative z-20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-20 pr-12 relative z-20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>


                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleRegister({
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: formData.get('password')
              });
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      className="pl-20 relative z-20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-20 relative z-20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-20 relative z-20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                    <Input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="pl-20 pr-12 relative z-20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
