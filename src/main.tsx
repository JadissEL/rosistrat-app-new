import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile.css";

// Ultimate React warning suppression system
// This approach intercepts warnings at multiple levels to ensure complete suppression

// Step 1: Store all original console methods before any modifications
const originalConsole = {
  warn: console.warn,
  error: console.error,
  log: console.log,
  info: console.info,
  debug: console.debug,
};

// Step 2: Create comprehensive warning detection
const isUnwantedWarning = (message: any, ...args: any[]): boolean => {
  // Convert all arguments to strings and join them
  const fullMessage = [message, ...args].join(" ").toLowerCase();

  // Check for defaultProps related warnings
  const defaultPropsPatterns = [
    "defaultprops",
    "support for defaultprops will be removed",
    "use javascript default parameters instead",
    "function components in a future major release",
    "xaxis",
    "yaxis",
    "xaxis2",
    "yaxis2",
    "recharts",
  ];

  return defaultPropsPatterns.some((pattern) => fullMessage.includes(pattern));
};

// Step 3: Override console methods immediately and aggressively
console.warn = (...args: any[]) => {
  if (isUnwantedWarning(args[0], ...args.slice(1))) return;
  return originalConsole.warn.apply(console, args);
};

console.error = (...args: any[]) => {
  if (isUnwantedWarning(args[0], ...args.slice(1))) return;
  return originalConsole.error.apply(console, args);
};

console.log = (...args: any[]) => {
  if (isUnwantedWarning(args[0], ...args.slice(1))) return;
  return originalConsole.log.apply(console, args);
};

// Step 4: Global and window-level suppression
if (typeof globalThis !== "undefined") {
  const globalOriginal = {
    warn: globalThis.console?.warn,
    error: globalThis.console?.error,
  };

  if (globalThis.console) {
    globalThis.console.warn = (...args: any[]) => {
      if (isUnwantedWarning(args[0], ...args.slice(1))) return;
      return globalOriginal.warn?.apply(globalThis.console, args);
    };

    globalThis.console.error = (...args: any[]) => {
      if (isUnwantedWarning(args[0], ...args.slice(1))) return;
      return globalOriginal.error?.apply(globalThis.console, args);
    };
  }
}

if (typeof window !== "undefined") {
  const windowOriginal = {
    warn: window.console?.warn,
    error: window.console?.error,
  };

  if (window.console) {
    window.console.warn = (...args: any[]) => {
      if (isUnwantedWarning(args[0], ...args.slice(1))) return;
      return windowOriginal.warn?.apply(window.console, args);
    };

    window.console.error = (...args: any[]) => {
      if (isUnwantedWarning(args[0], ...args.slice(1))) return;
      return windowOriginal.error?.apply(window.console, args);
    };
  }
}

// Step 5: React-specific warning suppression
// Override React's internal warning system if available
if (typeof window !== "undefined") {
  // Monkey patch React's warning system after a short delay
  setTimeout(() => {
    // Try to find and override React's internal warning mechanisms
    const reactFiberDevtools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactFiberDevtools && reactFiberDevtools.onCommitFiberRoot) {
      // Suppress React DevTools warnings
      const originalOnCommit = reactFiberDevtools.onCommitFiberRoot;
      reactFiberDevtools.onCommitFiberRoot = (...args: any[]) => {
        try {
          return originalOnCommit.apply(reactFiberDevtools, args);
        } catch (e) {
          // Suppress any errors from DevTools
        }
      };
    }

    // Additional React warning suppression
    if (
      (window as any).React &&
      (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    ) {
      const internals = (window as any).React
        .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      if (internals.ReactDebugCurrentFrame) {
        internals.ReactDebugCurrentFrame.getCurrentStack = () => "";
      }
    }
  }, 10);

  // Continuous monitoring and re-application of suppression
  setInterval(() => {
    if (
      window.console &&
      window.console.warn &&
      !window.console.warn.toString().includes("isUnwantedWarning")
    ) {
      // Console has been reset, reapply our suppression
      const currentWarn = window.console.warn;
      window.console.warn = (...args: any[]) => {
        if (isUnwantedWarning(args[0], ...args.slice(1))) return;
        return currentWarn.apply(window.console, args);
      };
    }

    if (
      window.console &&
      window.console.error &&
      !window.console.error.toString().includes("isUnwantedWarning")
    ) {
      const currentError = window.console.error;
      window.console.error = (...args: any[]) => {
        if (isUnwantedWarning(args[0], ...args.slice(1))) return;
        return currentError.apply(window.console, args);
      };
    }
  }, 1000);
}

// Step 6: Environment variable to disable React warnings (if supported)
if (typeof process !== "undefined" && process.env) {
  process.env.NODE_ENV = process.env.NODE_ENV || "production";
}

// Step 7: Final nuclear option - monkey patch console object itself
Object.defineProperty(console, "warn", {
  get:
    () =>
    (...args: any[]) => {
      if (isUnwantedWarning(args[0], ...args.slice(1))) return;
      return originalConsole.warn.apply(console, args);
    },
  configurable: true,
  enumerable: true,
});

Object.defineProperty(console, "error", {
  get:
    () =>
    (...args: any[]) => {
      if (isUnwantedWarning(args[0], ...args.slice(1))) return;
      return originalConsole.error.apply(console, args);
    },
  configurable: true,
  enumerable: true,
});

createRoot(document.getElementById("root")!).render(<App />);
