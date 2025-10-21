import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export function LoginDebug() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testDoctorLogin = async () => {
    setLoading(true);
    try {
      console.log('Testing doctor login...');
      
      // Test old doctor system
      const doctorResponse = await axios.post('http://localhost:8000/api/doctor/log', {
        email: 'test@doctor.com', // Replace with actual test credentials
        password: 'password123'
      });
      
      console.log('Doctor login response:', doctorResponse.data);
      
      if (doctorResponse.data.msg === "Success") {
        // Get doctor details
        const doctorDetailsResponse = await axios.get('http://localhost:8000/api/doctor');
        console.log('All doctors:', doctorDetailsResponse.data);
        
        const doctor = doctorDetailsResponse.data.value.find(d => d._id === doctorResponse.data.id);
        console.log('Found doctor:', doctor);
        
        if (doctor) {
          const userData = {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            role: 'doctor',
            phone: doctor.phone,
            specialty: doctor.specialty,
            qualification: doctor.qualification,
            experience: doctor.experience
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('doctor', JSON.stringify(doctor));
          localStorage.setItem('token', 'doctor_token_' + doctor._id);
          
          toast({
            title: "Test Login Successful! 🎉",
            description: `Welcome, Dr. ${doctor.name}!`,
          });
          
          setTimeout(() => {
            window.location.href = '/doctor';
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Test login error:', error);
      toast({
        title: "Test Login Failed",
        description: error.response?.data?.message || "Login failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    toast({
      title: "Storage Cleared",
      description: "All localStorage data has been cleared.",
    });
  };

  const showStorageData = () => {
    console.log('Current localStorage:');
    console.log('User:', localStorage.getItem('user'));
    console.log('Doctor:', localStorage.getItem('doctor'));
    console.log('Token:', localStorage.getItem('token'));
    console.log('All keys:', Object.keys(localStorage));
    
    toast({
      title: "Storage Data",
      description: "Check browser console for localStorage data.",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="text-sm font-bold mb-2">Login Debug Tools</h3>
      <div className="space-y-2">
        <Button 
          onClick={testDoctorLogin} 
          disabled={loading}
          size="sm"
          className="w-full text-xs"
        >
          {loading ? 'Testing...' : 'Test Doctor Login'}
        </Button>
        <Button 
          onClick={showStorageData} 
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          Show Storage Data
        </Button>
        <Button 
          onClick={clearStorage} 
          variant="destructive"
          size="sm"
          className="w-full text-xs"
        >
          Clear Storage
        </Button>
      </div>
    </div>
  );
}

export default LoginDebug;
