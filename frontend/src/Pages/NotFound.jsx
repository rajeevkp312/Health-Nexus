import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Heart } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animated Heart Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-white rounded-full shadow-lg">
            <Heart className="h-16 w-16 text-blue-600 animate-pulse" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have wandered off. 
          Don't worry, our medical team is here to help you find your way back to health.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-white/50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-600">
            Need immediate medical assistance? 
            <br />
            <span className="font-semibold text-blue-600">Call: +1 (555) EMERGENCY</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
