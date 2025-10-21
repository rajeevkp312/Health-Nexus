import { useEffect, useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { HospitalFeaturesSection } from "@/components/HospitalFeaturesSection";
import { SpecialtiesSection } from "@/components/SpecialtiesSection";
import { DoctorsSection } from "@/components/DoctorsSection";
import { StatisticsSection } from "@/components/StatisticsSection";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
 import { ChatbotAssistant } from "@/components/ChatbotAssistant";
 import { AdminAccess } from "@/components/AdminAccess";
 import { PatientRightsModal } from "@/components/PatientRightsModal";
 import { AboutUsModal } from "@/components/AboutUsModal";
 import { CareersModal } from "@/components/CareersModal";
 import { BillingInsuranceModal } from "@/components/BillingInsuranceModal";
 import { VisitorInformationModal } from "@/components/VisitorInformationModal";
 import { MedicalRecordsModal } from "@/components/MedicalRecordsModal";

export default function Index() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState(null);
  const [defaultRole, setDefaultRole] = useState("");
  const [rightsOpen, setRightsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [visitorOpen, setVisitorOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setAuthRedirectTo(e.detail?.redirectTo || null);
      setDefaultRole(e.detail?.defaultRole || "patient");
      setAuthOpen(true);
    };
    window.addEventListener("openAuthModal", handler);
    return () => window.removeEventListener("openAuthModal", handler);
  }, []);

  useEffect(() => {
    const handler = () => setRightsOpen(true);
    window.addEventListener("openPatientRights", handler);
    return () => window.removeEventListener("openPatientRights", handler);
  }, []);

  useEffect(() => {
    const handler = () => setAboutOpen(true);
    window.addEventListener("openAboutUs", handler);
    return () => window.removeEventListener("openAboutUs", handler);
  }, []);

  useEffect(() => {
    const handler = () => setCareersOpen(true);
    window.addEventListener("openCareers", handler);
    return () => window.removeEventListener("openCareers", handler);
  }, []);

  useEffect(() => {
    const handler = () => setBillingOpen(true);
    window.addEventListener("openBillingInsurance", handler);
    return () => window.removeEventListener("openBillingInsurance", handler);
  }, []);

  useEffect(() => {
    const handler = () => setVisitorOpen(true);
    window.addEventListener("openVisitorInformation", handler);
    return () => window.removeEventListener("openVisitorInformation", handler);
  }, []);

  useEffect(() => {
    const handler = () => setRecordsOpen(true);
    window.addEventListener("openMedicalRecords", handler);
    return () => window.removeEventListener("openMedicalRecords", handler);
  }, []);

  return (
    <div className="bg-white">
      <HeroSection onLoginClick={() => setAuthOpen(true)} onBookAppointmentClick={() => setAuthOpen(true)} />
      <HospitalFeaturesSection />
      <SpecialtiesSection />
      <DoctorsSection />
      <StatisticsSection />
      <Footer />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo={authRedirectTo}
        defaultRole={defaultRole}
      />

      <PatientRightsModal
        isOpen={rightsOpen}
        onClose={() => setRightsOpen(false)}
      />

      <AboutUsModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <CareersModal
        isOpen={careersOpen}
        onClose={() => setCareersOpen(false)}
      />

      <BillingInsuranceModal
        isOpen={billingOpen}
        onClose={() => setBillingOpen(false)}
      />

      <VisitorInformationModal
        isOpen={visitorOpen}
        onClose={() => setVisitorOpen(false)}
      />

      <MedicalRecordsModal
        isOpen={recordsOpen}
        onClose={() => setRecordsOpen(false)}
      />

      {/* Floating icons only on home page */}
      <ChatbotAssistant />
      <AdminAccess />
    </div>
  );
}

