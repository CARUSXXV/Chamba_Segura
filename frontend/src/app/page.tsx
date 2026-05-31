"use client";

import { useAuth } from "@/context/AuthContext";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import SocialProof from "./components/SocialProof";
import ProblemSection from "./components/ProblemSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorks from "./components/HowItWorks";
import PricingSection from "./components/PricingSection";
import Testimonials from "./components/Testimonials";
import FaqSection from "./components/FaqSection";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import AppDashboard from "./components/AppDashboard";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) {
    return <AppDashboard />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      <Navigation />
      <HeroSection />
      <SocialProof />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <Testimonials />
      <FaqSection />
      <FinalCta />
      <Footer />
    </div>
  );
}
