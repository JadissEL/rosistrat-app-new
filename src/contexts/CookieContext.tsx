import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

interface CookieContextType {
  hasConsent: boolean;
  analyticsConsent: boolean;
  showBanner: boolean;
  acceptAll: () => void;
  acceptNecessary: () => void;
  updateConsent: (analytics: boolean) => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieProvider");
  }
  return context;
}

interface CookieProviderProps {
  children: ReactNode;
}

export function CookieProvider({ children }: CookieProviderProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const consent = Cookies.get("rosistrat-cookie-consent");
    const analytics = Cookies.get("rosistrat-analytics-consent");

    if (consent) {
      setHasConsent(true);
      setAnalyticsConsent(analytics === "true");
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    setHasConsent(true);
    setAnalyticsConsent(true);
    setShowBanner(false);

    // Set cookies for 1 year
    Cookies.set("rosistrat-cookie-consent", "true", { expires: 365 });
    Cookies.set("rosistrat-analytics-consent", "true", { expires: 365 });
  };

  const acceptNecessary = () => {
    setHasConsent(true);
    setAnalyticsConsent(false);
    setShowBanner(false);

    // Set cookies for 1 year
    Cookies.set("rosistrat-cookie-consent", "true", { expires: 365 });
    Cookies.set("rosistrat-analytics-consent", "false", { expires: 365 });
  };

  const updateConsent = (analytics: boolean) => {
    setAnalyticsConsent(analytics);
    Cookies.set("rosistrat-analytics-consent", analytics.toString(), {
      expires: 365,
    });
  };

  const value: CookieContextType = {
    hasConsent,
    analyticsConsent,
    showBanner,
    acceptAll,
    acceptNecessary,
    updateConsent,
  };

  return (
    <CookieContext.Provider value={value}>{children}</CookieContext.Provider>
  );
}
