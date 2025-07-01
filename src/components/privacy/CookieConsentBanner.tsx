import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCookieConsent } from "@/contexts/CookieContext";
import { Cookie, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieConsentBanner() {
  const { showBanner, acceptAll, acceptNecessary } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-yellow-200 bg-yellow-50 shadow-lg dark:border-yellow-800 dark:bg-yellow-950">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  Cookie Consent
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  We use cookies to enhance your experience and provide
                  analytics to improve our service. Essential cookies are
                  required for the site to function properly.
                </p>
              </div>

              <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                <div>
                  <strong>Essential Cookies:</strong> Required for
                  authentication, session management, and core functionality.
                </div>
                <div>
                  <strong>Analytics Cookies:</strong> Help us understand how you
                  use RoSiStrat to improve our service (optional).
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  <a
                    href="/privacy"
                    className="underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read our Privacy Policy
                  </a>{" "}
                  for more details.
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={acceptNecessary}
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900"
                  >
                    Essential Only
                  </Button>
                  <Button
                    onClick={acceptAll}
                    className="bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
