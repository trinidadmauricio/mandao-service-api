/**
 * Firebase Cloud Messaging Service (Stub)
 * Este archivo se importa pero la implementación completa está en el branch feature/api-firebase-setup
 */

import 'reflect-metadata';
import { injectable } from 'inversify';

@injectable()
export class FCMService {
  isAvailable(): boolean {
    return false; // Stub - implementación real en feature/api-firebase-setup
  }

  async sendToDevice(
    _token: string,
    _payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return { success: false, error: 'FCM not configured' };
  }

  async sendToMultipleDevices(
    _tokens: string[],
    _payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<{ successCount: number; failureCount: number; responses: any[] }> {
    return { successCount: 0, failureCount: _tokens.length, responses: [] };
  }
}
