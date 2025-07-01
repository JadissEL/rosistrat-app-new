import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { SimulationService } from "@/services/simulationService";
import { isDemoMode } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, AlertCircle, Info } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup" | "reset";
}

export function AuthDialog({
  open,
  onOpenChange,
  defaultTab = "signin",
}: AuthDialogProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    setError("");

    try {
      await signIn(data.email, data.password);

      // Migrate local data to cloud
      await SimulationService.migrateLocalToCloud(data.email);

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account.",
        variant: "default",
      });

      onOpenChange(false);
      signInForm.reset();
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    setError("");

    try {
      await signUp(data.email, data.password, data.displayName);

      toast({
        title: "Account created successfully!",
        description: `Welcome to RoSiStrat, ${data.displayName}! Your account is ready to use.`,
        variant: "default",
      });

      onOpenChange(false);
      signUpForm.reset();
    } catch (error: any) {
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError("");

    try {
      await resetPassword(data.email);
      setResetEmailSent(true);

      toast({
        title: "Password reset email sent!",
        description:
          "Check your inbox for instructions to reset your password.",
        variant: "default",
      });

      resetPasswordForm.reset();
    } catch (error: any) {
      setError(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError("");
    setResetEmailSent(false);
  };

  // Reset tab when dialog opens with new defaultTab
  React.useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      setError("");
      setResetEmailSent(false);
    }
  }, [open, defaultTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Welcome to RoSiStrat
          </DialogTitle>
          <DialogDescription className="text-center">
            {isDemoMode
              ? "Demo Mode - Authentication is currently disabled"
              : "Sign in to save your simulation data permanently"}
          </DialogDescription>
        </DialogHeader>

        {isDemoMode && (
          <Alert className="border-blue-500 bg-blue-950/50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode Active:</strong> Authentication is currently
              disabled. You can use all simulation features as a guest, but data
              will only be saved locally. To enable real authentication,
              configure Firebase in the environment settings.
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="signin" className="space-y-4">
            <form
              onSubmit={signInForm.handleSubmit(handleSignIn)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...signInForm.register("email")}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    {...signInForm.register("password")}
                  />
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || isDemoMode}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDemoMode ? "Demo Mode - Sign In Disabled" : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form
              onSubmit={signUpForm.handleSubmit(handleSignUp)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-name">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your name"
                    className="pl-10"
                    {...signUpForm.register("displayName")}
                  />
                </div>
                {signUpForm.formState.errors.displayName && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.displayName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...signUpForm.register("email")}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    {...signUpForm.register("password")}
                  />
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    {...signUpForm.register("confirmPassword")}
                  />
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || isDemoMode}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDemoMode ? "Demo Mode - Sign Up Disabled" : "Create Account"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reset" className="space-y-4">
            {resetEmailSent ? (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Password reset email sent! Check your inbox for instructions.
                </AlertDescription>
              </Alert>
            ) : (
              <form
                onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...resetPasswordForm.register("email")}
                    />
                  </div>
                  {resetPasswordForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {resetPasswordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || isDemoMode}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isDemoMode
                    ? "Demo Mode - Reset Disabled"
                    : "Send Reset Email"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-blue-500 hover:underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
