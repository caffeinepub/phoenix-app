// CloudSyncService - bridges local localStorage DB with ICP cloud backend
// Architecture: Write to local first (instant), then async sync to cloud
// If cloud is unavailable, local data is still accessible (offline mode)

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

type SyncListener = (status: SyncStatus, lastSync: number | null) => void;

class CloudSyncService {
  private status: SyncStatus = "synced";
  private lastSync: number | null = null;
  private listeners: Set<SyncListener> = new Set();
  private syncQueue: (() => Promise<void>)[] = [];
  private isSyncing = false;

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const l of this.listeners) l(this.status, this.lastSync);
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  getLastSync(): number | null {
    return this.lastSync;
  }

  // Called after every local DB write to trigger background cloud sync
  async enqueueSyncOperation(operation: () => Promise<void>) {
    this.syncQueue.push(operation);
    if (!this.isSyncing) {
      await this.flushQueue();
    }
  }

  private async flushQueue() {
    if (this.syncQueue.length === 0) return;
    this.isSyncing = true;
    this.status = "syncing";
    this.notify();

    while (this.syncQueue.length > 0) {
      const op = this.syncQueue.shift()!;
      try {
        await op();
        this.status = "synced";
        this.lastSync = Date.now();
      } catch (err) {
        // Cloud unavailable - local data is preserved, mark offline
        this.status = "offline";
        console.warn(
          "[CloudSync] Cloud sync failed, using local fallback:",
          err,
        );
        // Re-queue failed operations for retry
        this.syncQueue.unshift(op);
        break;
      }
    }

    this.isSyncing = false;
    this.notify();

    // Schedule retry if offline
    if (this.status === "offline") {
      setTimeout(() => this.retrySync(), 30000);
    }
  }

  private async retrySync() {
    if (this.syncQueue.length > 0 && !this.isSyncing) {
      await this.flushQueue();
    }
  }

  // Simulate persisting a data snapshot to cloud (ICP canister)
  // In production this would call the actual ICP backend actor methods
  async syncUserData(paymentId: string, data: Record<string, unknown>) {
    return this.enqueueSyncOperation(async () => {
      // Simulate network latency - in production replace with actual ICP calls
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Simulate 95% success rate for cloud sync
          if (Math.random() > 0.05) {
            resolve();
          } else {
            reject(new Error("Network unavailable"));
          }
        }, 300);
      });
      // Store a cloud-synced copy with timestamp
      try {
        localStorage.setItem(
          `phonex_cloud_sync_${paymentId}`,
          JSON.stringify({ ...data, cloudSyncedAt: Date.now() }),
        );
      } catch {}
    });
  }

  async syncTransactions(paymentId: string) {
    const key = `phonex_db_txs_${paymentId}`;
    const data = localStorage.getItem(key);
    if (data)
      await this.syncUserData(`txs_${paymentId}`, {
        transactions: JSON.parse(data),
      });
  }

  async syncMessages(key: string) {
    const data = localStorage.getItem(key);
    if (data) await this.syncUserData(key, { messages: JSON.parse(data) });
  }
}

export const cloudSync = new CloudSyncService();
