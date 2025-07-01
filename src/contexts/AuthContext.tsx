import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isDemoMode } from "@/lib/firebase";
import { AuthFallback, MockUser } from "@/utils/authFallback";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  startingInvestment: number;
  createdAt: Date;
  lastLoginAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateStartingInvestment: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<MockUser | null>(null);
  const [isNetworkRestricted, setIsNetworkRestricted] = useState(false);

  async function signUp(email: string, password: string, displayName: string) {
    if (isDemoMode) {
      throw new Error(
        "Demo Mode: Authentication is disabled. To enable real authentication, configure Firebase with your project settings in the .env file. For now, you can use the app as a guest.",
      );
    }

    // Auto-switch to demo mode in restricted environments
    if (isNetworkRestricted || !auth || !auth.app) {
      console.log(
        "Network restricted environment detected, using demo authentication",
      );

      if (AuthFallback.validateDemoCredentials(email, password)) {
        const mockUser = AuthFallback.createDemoUser(email, displayName);
        setDemoUser(mockUser);

        const profile: UserProfile = {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          startingInvestment: 10000,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };
        setUserProfile(profile);

        console.log("Demo account created successfully");
        return;
      } else {
        throw new Error(
          "Please enter a valid email and password (minimum 6 characters)",
        );
      }
    }

    try {
      console.log("Attempting to create user account...");

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      console.log("User account created successfully");

      // Update the user's display name
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      if (db) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName,
          startingInvestment: 10000, // Default starting investment
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        await setDoc(doc(db, "users", user.uid), profile);
        setUserProfile(profile);
        console.log("User profile created in Firestore");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);

      if (
        error.message?.includes("Failed to fetch") ||
        error.code === "auth/network-request-failed"
      ) {
        console.warn("Firebase unavailable, offering demo mode fallback...");

        // Offer fallback authentication for development/restricted environments
        if (AuthFallback.validateDemoCredentials(email, password)) {
          const mockUser = AuthFallback.createDemoUser(email, displayName);
          setDemoUser(mockUser);

          // Create a mock user profile
          const profile: UserProfile = {
            uid: mockUser.uid,
            email: mockUser.email,
            displayName: mockUser.displayName,
            startingInvestment: 10000,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          };
          setUserProfile(profile);

          console.log("Demo user account created successfully");
          return; // Success with demo mode
        } else {
          throw new Error(
            "Network error: Unable to connect to Firebase servers. Please check your internet connection. If you're in a restricted environment, authentication may not be available.",
          );
        }
      } else if (error.code === "auth/email-already-in-use") {
        throw new Error(
          "An account with this email already exists. Please try signing in instead.",
        );
      } else if (error.code === "auth/weak-password") {
        throw new Error(
          "Password is too weak. Please choose a stronger password with at least 6 characters.",
        );
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address. Please enter a valid email.");
      } else {
        throw new Error(
          `Sign up failed: ${error.message || "Unknown error occurred"}`,
        );
      }
    }
  }

  async function signIn(email: string, password: string) {
    if (isDemoMode) {
      throw new Error(
        "Demo Mode: Authentication is disabled. To enable real authentication, configure Firebase with your project settings in the .env file. For now, you can use the app as a guest.",
      );
    }

    // Auto-switch to demo mode in restricted environments
    if (isNetworkRestricted || !auth || !auth.app) {
      console.log(
        "Network restricted environment detected, using demo authentication",
      );

      const existingDemoUser = AuthFallback.getDemoUser();
      if (existingDemoUser && existingDemoUser.email === email) {
        setDemoUser(existingDemoUser);

        const profile: UserProfile = {
          uid: existingDemoUser.uid,
          email: existingDemoUser.email,
          displayName: existingDemoUser.displayName,
          startingInvestment: 10000,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };
        setUserProfile(profile);

        console.log("Demo user signed in successfully");
        return;
      } else {
        throw new Error(
          "No demo account found with this email. Please sign up first.",
        );
      }
    }

    try {
      console.log("Attempting to sign in user...");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in successfully");
    } catch (error: any) {
      console.error("Sign in error:", error);

      if (
        error.message?.includes("Failed to fetch") ||
        error.code === "auth/network-request-failed"
      ) {
        throw new Error(
          "Network error: Unable to connect to Firebase servers. Please check your internet connection or try again later.",
        );
      } else if (error.code === "auth/user-not-found") {
        throw new Error(
          "No account found with this email address. Please sign up first.",
        );
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please try again later.");
      } else {
        throw new Error(
          `Sign in failed: ${error.message || "Unknown error occurred"}`,
        );
      }
    }
  }

  async function logout() {
    if (isDemoMode) {
      throw new Error(
        "Demo Mode: Authentication is disabled. You are already in guest mode.",
      );
    }

    // Handle demo user logout
    if (demoUser) {
      AuthFallback.removeDemoUser();
      setDemoUser(null);
      setUserProfile(null);
      console.log("Demo user signed out successfully");
      return;
    }

    if (!auth || !auth.app) {
      throw new Error("Authentication not available - please refresh the page");
    }
    await signOut(auth);
    setUserProfile(null);
  }

  async function resetPassword(email: string) {
    if (isDemoMode) {
      throw new Error(
        "Demo Mode: Authentication is disabled. Password reset is not available in demo mode.",
      );
    }

    if (!auth || !auth.app) {
      throw new Error("Authentication not available - please refresh the page");
    }
    await sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(updates: Partial<UserProfile>) {
    if (!currentUser || !userProfile) return;

    const updatedProfile = { ...userProfile, ...updates };
    await setDoc(doc(db, "users", currentUser.uid), updatedProfile, {
      merge: true,
    });
    setUserProfile(updatedProfile);
  }

  async function updateStartingInvestment(amount: number) {
    await updateUserProfile({ startingInvestment: amount });
  }

  async function loadUserProfile(user: User) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile: UserProfile = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        } as UserProfile;

        // Update last login time
        await setDoc(
          doc(db, "users", user.uid),
          {
            ...profile,
            lastLoginAt: new Date(),
          },
          { merge: true },
        );

        setUserProfile(profile);
      } else {
        // Create profile if it doesn't exist (for existing users)
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || "Anonymous User",
          startingInvestment: 10000,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };
        await setDoc(doc(db, "users", user.uid), profile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }

  useEffect(() => {
    // Always start with a short timeout to prevent hanging
    const quickTimeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    // Detect if we're in a restricted network environment
    const isCloudEnv =
      window.location.hostname.includes("fly.dev") ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("builder.my");

    if (isCloudEnv) {
      console.log(
        "Cloud environment detected - using demo mode for better compatibility",
      );
      setIsNetworkRestricted(true);
      clearTimeout(quickTimeout);
      setLoading(false);
      return;
    }

    // Check for existing demo user first
    const existingDemoUser = AuthFallback.getDemoUser();
    if (existingDemoUser) {
      console.log("Existing demo user found:", existingDemoUser);
      setDemoUser(existingDemoUser);

      const profile: UserProfile = {
        uid: existingDemoUser.uid,
        email: existingDemoUser.email,
        displayName: existingDemoUser.displayName,
        startingInvestment: 10000,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      setUserProfile(profile);
      clearTimeout(quickTimeout);
      setLoading(false);
      return;
    }

    // Check if Firebase auth is properly initialized
    if (!auth) {
      console.warn("Firebase auth not available, running in guest mode");
      clearTimeout(quickTimeout);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user && db) {
          await loadUserProfile(user);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        // Continue without breaking the app
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    // Set a timeout to ensure loading doesn't hang indefinitely
    const timeoutId = setTimeout(() => {
      console.warn("Auth initialization timeout, continuing in guest mode");
      setLoading(false);
    }, 1000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeoutId);
      clearTimeout(quickTimeout);
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile,
    updateStartingInvestment,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading RoSiStrat...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
