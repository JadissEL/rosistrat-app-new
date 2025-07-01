import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieProvider } from "@/contexts/CookieContext";
import { CookieConsentBanner } from "@/components/privacy/CookieConsentBanner";
import { AgeVerificationModal } from "@/components/privacy/AgeVerificationModal";
import Index from "./pages/Index";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CookieProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Analytics />
          <SpeedInsights />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsentBanner />
            <AgeVerificationModal />
          </BrowserRouter>
        </AuthProvider>
      </CookieProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
