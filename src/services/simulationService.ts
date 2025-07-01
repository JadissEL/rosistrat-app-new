import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SimulationResult {
  id?: string;
  userId?: string; // Only for authenticated users
  strategy: string;
  startingInvestment: number;
  finalEarnings: number;
  finalPortfolio: number;
  totalSpins: number;
  timestamp: Date;
  settings: Record<string, any>;
  results: any[]; // Full simulation results
}

export interface LocalSimulationData {
  simulations: SimulationResult[];
  startingInvestment: number;
  multiSimResults: Record<string, number[]>;
}

const LOCAL_STORAGE_KEY = "rosistrat-simulation-data";
const SESSION_STORAGE_KEY = "rosistrat-session-data";

export class SimulationService {
  // Local storage methods (for non-authenticated users)
  static getLocalData(): LocalSimulationData {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading local simulation data:", error);
    }

    return {
      simulations: [],
      startingInvestment: 10000,
      multiSimResults: {
        compound_martingale: [],
        max_lose: [],
        zapping: [],
        safe_compound_martingale: [],
        sam_plus: [],
        standard_martingale: [],
      },
    };
  }

  static saveLocalData(data: LocalSimulationData): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving local simulation data:", error);
    }
  }

  static getSessionData(): LocalSimulationData {
    try {
      const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading session simulation data:", error);
    }

    return {
      simulations: [],
      startingInvestment: 10000,
      multiSimResults: {
        compound_martingale: [],
        max_lose: [],
        zapping: [],
        safe_compound_martingale: [],
        sam_plus: [],
        standard_martingale: [],
      },
    };
  }

  static saveSessionData(data: LocalSimulationData): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving session simulation data:", error);
    }
  }

  static updateLocalStartingInvestment(amount: number): void {
    const data = this.getLocalData();
    data.startingInvestment = amount;
    this.saveLocalData(data);
  }

  static addLocalSimulation(
    simulation: Omit<SimulationResult, "id" | "userId">,
  ): void {
    const data = this.getLocalData();
    const newSimulation: SimulationResult = {
      ...simulation,
      id: `local_${Date.now()}`,
      timestamp: new Date(),
    };
    data.simulations.push(newSimulation);

    // Also update multi-sim results
    if (
      data.multiSimResults[
        simulation.strategy as keyof typeof data.multiSimResults
      ]
    ) {
      data.multiSimResults[
        simulation.strategy as keyof typeof data.multiSimResults
      ].push(simulation.finalEarnings);
    }

    this.saveLocalData(data);
  }

  static clearLocalData(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  // Cloud storage methods (for authenticated users)
  static async saveSimulation(
    simulation: Omit<SimulationResult, "id">,
    userId: string,
  ): Promise<string> {
    try {
      const simulationData = {
        ...simulation,
        userId,
        timestamp: Timestamp.fromDate(simulation.timestamp),
      };

      const docRef = await addDoc(
        collection(db, "simulations"),
        simulationData,
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving simulation:", error);
      throw error;
    }
  }

  static async getUserSimulations(userId: string): Promise<SimulationResult[]> {
    try {
      const q = query(
        collection(db, "simulations"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const simulations: SimulationResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        simulations.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        } as SimulationResult);
      });

      return simulations;
    } catch (error) {
      console.error("Error fetching user simulations:", error);
      throw error;
    }
  }

  static async deleteSimulation(simulationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "simulations", simulationId));
    } catch (error) {
      console.error("Error deleting simulation:", error);
      throw error;
    }
  }

  // Helper method to migrate local data to cloud when user signs in
  static async migrateLocalToCloud(userId: string): Promise<void> {
    try {
      const localData = this.getLocalData();
      const migrationPromises = localData.simulations.map((simulation) => {
        const { id, ...simulationWithoutId } = simulation;
        return this.saveSimulation(simulationWithoutId, userId);
      });

      await Promise.all(migrationPromises);

      // Clear local data after successful migration
      this.clearLocalData();
    } catch (error) {
      console.error("Error migrating local data to cloud:", error);
      // Don't throw - allow the app to continue functioning
    }
  }
}
