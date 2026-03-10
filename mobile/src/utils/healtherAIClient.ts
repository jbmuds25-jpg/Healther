/**
 * Healther AI Client - Unified SDK for all platforms
 * Handles AI communication, offline sync, and state management
 */

interface HealtherAIClientOptions {
  apiEndpoint?: string;
  userId?: string;
  userRole?: string;
  platform?: string;
  debug?: boolean;
  storage?: any;
  onMessageReceived?: (response: any) => void;
  onError?: (error: any) => void;
  onConnectionChanged?: (status: { connected: boolean }) => void;
}

export default class HealtherAIClient {
  private apiEndpoint: string;
  private userId: string | null;
  private userRole: string;
  private platform: string;
  private debug: boolean;
  private storage: any;
  private onMessageReceived?: (response: any) => void;
  private onError?: (error: any) => void;
  private onConnectionChanged?: (status: { connected: boolean }) => void;
  private isOnline: boolean = true;

  constructor(options: HealtherAIClientOptions = {}) {
    this.apiEndpoint = options.apiEndpoint || 'http://localhost:3000/api/ai';
    this.userId = options.userId || null;
    this.userRole = options.userRole || 'citizen';
    this.platform = options.platform || 'web';
    this.debug = options.debug || false;
    this.storage = options.storage;
    this.onMessageReceived = options.onMessageReceived;
    this.onError = options.onError;
    this.onConnectionChanged = options.onConnectionChanged;

    if (this.debug) {
      console.log('[HealtherAI] Initialized:', {
        platform: this.platform,
        userId: this.userId,
        userRole: this.userRole,
      });
    }
  }

  /**
   * Send a message to the AI
   */
  async chat(message: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: this.userId,
          platform: this.platform,
          userRole: this.userRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (this.onMessageReceived) {
        this.onMessageReceived(data);
      }

      return data;
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Get AI capabilities
   */
  async getCapabilities(): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/capabilities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Update user information
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  setUserRole(role: string): void {
    this.userRole = role;
  }

  /**
   * Get current status
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Manual connection check
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/health`, {
        method: 'GET',
      });
      const connected = response.ok;
      if (this.isOnline !== connected) {
        this.isOnline = connected;
        if (this.onConnectionChanged) {
          this.onConnectionChanged({ connected });
        }
      }
      return connected;
    } catch {
      if (this.isOnline) {
        this.isOnline = false;
        if (this.onConnectionChanged) {
          this.onConnectionChanged({ connected: false });
        }
      }
      return false;
    }
  }
}
