import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already verified age
    const hasVerified = localStorage.getItem("rosistrat-age-verified");
    if (!hasVerified) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirmAge = () => {
    localStorage.setItem("rosistrat-age-verified", "true");
    setIsOpen(false);
  };

  const handleDeclineAge = () => {
    // Redirect to a safe page or show educational message
    window.location.href = "https://www.gamcare.org.uk/";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
            Age Verification Required
          </DialogTitle>
          <DialogDescription className="text-base">
            RoSiStrat is an educational simulation platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This platform simulates gambling strategies for educational
              purposes only. You must be 18 years or older to use this service.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                Educational Purpose Only
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                RoSiStrat is designed to teach probability, risk management, and
                the mathematical realities of betting strategies.
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
              <h4 className="font-semibold text-red-800 dark:text-red-200">
                No Real Money Involved
              </h4>
              <p className="text-red-700 dark:text-red-300">
                All simulations use virtual currency. This is not real gambling
                and no actual money is wagered.
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                Responsible Gaming Awareness
              </h4>
              <p className="text-amber-700 dark:text-amber-300">
                Real gambling can be addictive and harmful. Please gamble
                responsibly if you choose to participate in real betting.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-center text-sm font-medium">
              Are you 18 years of age or older?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDeclineAge}
                className="flex-1"
              >
                No, I'm under 18
              </Button>
              <Button onClick={handleConfirmAge} className="flex-1">
                Yes, I'm 18 or older
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>
              For gambling addiction support:{" "}
              <a
                href="https://www.gamcare.org.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                GamCare.org.uk
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
