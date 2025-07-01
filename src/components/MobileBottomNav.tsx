import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  BarChart3,
  User,
  Settings,
  Heart,
  LogIn,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileBottomNavProps {
  activeStrategy: string;
  onShowAuthDialog: (tab: "signin" | "signup") => void;
  onShowUserDashboard: () => void;
  showUserDashboard: boolean;
}

export function MobileBottomNav({
  activeStrategy,
  onShowAuthDialog,
  onShowUserDashboard,
  showUserDashboard,
}: MobileBottomNavProps) {
  const { currentUser, userProfile } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToStrategy = () => {
    const strategySection = document.querySelector('[data-section="strategy"]');
    if (strategySection) {
      strategySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToResults = () => {
    const resultsSection = document.querySelector('[data-section="results"]');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openDonation = () => {
    window.open(
      "https://paypal.me/JadissEL?country.x=GR&locale.x=en_US",
      "_blank",
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {/* Home */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToTop}
          className="flex flex-col items-center gap-1 h-auto py-2 px-2"
        >
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-xs text-slate-300">Home</span>
        </Button>

        {/* Strategy */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToStrategy}
          className="flex flex-col items-center gap-1 h-auto py-2 px-2 relative"
        >
          <Settings className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-300">Strategy</span>
          {activeStrategy && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 text-xs px-1 h-4"
            >
              1
            </Badge>
          )}
        </Button>

        {/* Results */}
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToResults}
          className="flex flex-col items-center gap-1 h-auto py-2 px-2"
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-300">Results</span>
        </Button>

        {/* User Account */}
        <Button
          variant="ghost"
          size="sm"
          onClick={
            currentUser || userProfile
              ? onShowUserDashboard
              : () => onShowAuthDialog("signin")
          }
          className="flex flex-col items-center gap-1 h-auto py-2 px-2 relative"
        >
          {currentUser || userProfile ? (
            <>
              <User className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-300">Profile</span>
              {showUserDashboard && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300">Sign In</span>
            </>
          )}
        </Button>

        {/* Support */}
        <Button
          variant="ghost"
          size="sm"
          onClick={openDonation}
          className="flex flex-col items-center gap-1 h-auto py-2 px-2"
        >
          <Heart className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-slate-300">Support</span>
        </Button>
      </div>

      {/* Safe area padding for newer iPhones */}
      <div className="h-safe-area-inset-bottom"></div>
    </div>
  );
}
