// Alternative authentication fallback for restricted environments
export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  isDemo: boolean;
}

export class AuthFallback {
  private static STORAGE_KEY = "rosistrat-demo-user";

  static createDemoUser(email: string, displayName: string): MockUser {
    const demoUser: MockUser = {
      uid: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName,
      isDemo: true,
    };

    // Store in localStorage for persistence during session
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(demoUser));
    console.log("Demo user created:", demoUser);

    return demoUser;
  }

  static getDemoUser(): MockUser | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static removeDemoUser(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static validateDemoCredentials(email: string, password: string): boolean {
    // Simple validation for demo mode
    return email.includes("@") && password.length >= 6;
  }
}
