import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { type SyncStatus, cloudSync } from "../services/CloudSyncService";

interface SyncContextType {
  syncStatus: SyncStatus;
  lastSync: number | null;
}

const SyncContext = createContext<SyncContextType>({
  syncStatus: "synced",
  lastSync: null,
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    cloudSync.getStatus(),
  );
  const [lastSync, setLastSync] = useState<number | null>(
    cloudSync.getLastSync(),
  );

  useEffect(() => {
    const unsub = cloudSync.subscribe((status, last) => {
      setSyncStatus(status);
      setLastSync(last);
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <SyncContext.Provider value={{ syncStatus, lastSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncStatus() {
  return useContext(SyncContext);
}
