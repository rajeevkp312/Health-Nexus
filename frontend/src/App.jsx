import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./Pages/Index";
import NotFound from "./Pages/NotFound";
import AdminRoutes from "./Admin/AdminRoutes";
import DoctorRoutes from "./Doctor/DoctorRoutes";
import PatientRoutes from "./Patient/PatientRoutes";
import "./styles/text-visibility-fix.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            {/* Doctor Routes */}
            <Route path="/doctor/*" element={<DoctorRoutes />} />
            {/* Patient Routes */}
            <Route path="/patient/*" element={<PatientRoutes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;