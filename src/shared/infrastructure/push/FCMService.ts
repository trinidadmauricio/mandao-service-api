/**
 * Firebase Cloud Messaging Service
 * 
 * Servicio para enviar push notifications a dispositivos móviles
 * usando Firebase Cloud Messaging (FCM).
 */

import 'reflect-metadata';
import { injectable } from 'inversify';
import * as admin from 'firebase-admin';
import { getMessaging, isFirebaseAvailable } from '../../../config/firebase.config';
import { logger } from '../../utils/logger';

/**
 * Datos adicionales que se pueden enviar con la notificación
 */
export interface PushNotificationData {
  [key: string]: string;
}

/**
 * Payload de una notificación push
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: PushNotificationData;
  imageUrl?: string;
  badge?: number;
  sound?: string;
  channelId?: string; // Android notification channel
}

/**
 * Resultado de envío de notificación
 */
export interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Resultado de envío a múltiples tokens
 */
export interface MulticastResult {
  successCount: number;
  failureCount: number;
  responses: Array<{
    token: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
}

@injectable()
export class FCMService {
  /**
   * Verifica si el servicio FCM está disponible
   */
  isAvailable(): boolean {
    return isFirebaseAvailable();
  }

  /**
   * Envía una notificación a un dispositivo específico
   * 
   * @param token - FCM token del dispositivo
   * @param payload - Contenido de la notificación
   * @returns Resultado del envío
   */
  async sendToDevice(
    token: string,
    payload: PushNotificationPayload
  ): Promise<PushNotificationResult> {
    const messaging = getMessaging();

    if (!messaging) {
      logger.warn('FCM not available. Skipping push notification.');
      return {
        success: false,
        error: 'FCM not configured',
      };
    }

    if (!token || token.trim() === '') {
      return {
        success: false,
        error: 'Invalid device token',
      };
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          notification: {
            channelId: payload.channelId || 'default',
            sound: payload.sound || 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: payload.badge,
              sound: payload.sound || 'default',
            },
          },
        },
      };

      const response = await messaging.send(message);

      logger.info('Push notification sent successfully', {
        messageId: response,
        token: token.substring(0, 10) + '...', // Log parcial del token
      });

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorCode =
        error instanceof Error && 'code' in error
          ? (error as any).code
          : 'unknown';

      logger.error('Failed to send push notification', {
        error: errorMessage,
        code: errorCode,
        token: token.substring(0, 10) + '...',
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Envía una notificación a múltiples dispositivos
   * 
   * @param tokens - Array de FCM tokens
   * @param payload - Contenido de la notificación
   * @returns Resultado del envío con detalles por token
   */
  async sendToMultipleDevices(
    tokens: string[],
    payload: PushNotificationPayload
  ): Promise<MulticastResult> {
    const messaging = getMessaging();

    if (!messaging) {
      logger.warn('FCM not available. Skipping multicast push notification.');
      return {
        successCount: 0,
        failureCount: tokens.length,
        responses: tokens.map((token) => ({
          token,
          success: false,
          error: 'FCM not configured',
        })),
      };
    }

    // Filtrar tokens vacíos
    const validTokens = tokens.filter((t) => t && t.trim() !== '');

    if (validTokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        responses: [],
      };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: validTokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          notification: {
            channelId: payload.channelId || 'default',
            sound: payload.sound || 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: payload.badge,
              sound: payload.sound || 'default',
            },
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);

      const responses = response.responses.map((r, index) => ({
        token: validTokens[index],
        success: r.success,
        messageId: r.messageId,
        error: r.error?.message,
      }));

      logger.info('Multicast push notification sent', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: validTokens.length,
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error('Failed to send multicast push notification', {
        error: errorMessage,
        tokenCount: validTokens.length,
      });

      return {
        successCount: 0,
        failureCount: validTokens.length,
        responses: validTokens.map((token) => ({
          token,
          success: false,
          error: errorMessage,
        })),
      };
    }
  }

  /**
   * Envía una notificación a un topic (para broadcasts)
   * 
   * @param topic - Nombre del topic FCM
   * @param payload - Contenido de la notificación
   * @returns Resultado del envío
   */
  async sendToTopic(
    topic: string,
    payload: PushNotificationPayload
  ): Promise<PushNotificationResult> {
    const messaging = getMessaging();

    if (!messaging) {
      logger.warn('FCM not available. Skipping topic push notification.');
      return {
        success: false,
        error: 'FCM not configured',
      };
    }

    if (!topic || topic.trim() === '') {
      return {
        success: false,
        error: 'Invalid topic',
      };
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data,
        android: {
          notification: {
            channelId: payload.channelId || 'default',
            sound: payload.sound || 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: payload.badge,
              sound: payload.sound || 'default',
            },
          },
        },
      };

      const response = await messaging.send(message);

      logger.info('Topic push notification sent', {
        messageId: response,
        topic,
      });

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error('Failed to send topic push notification', {
        error: errorMessage,
        topic,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Suscribe tokens a un topic
   */
  async subscribeToTopic(
    tokens: string[],
    topic: string
  ): Promise<{ successCount: number; failureCount: number }> {
    const messaging = getMessaging();

    if (!messaging) {
      return { successCount: 0, failureCount: tokens.length };
    }

    try {
      const response = await messaging.subscribeToTopic(tokens, topic);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error('Failed to subscribe to topic', { error, topic });
      return { successCount: 0, failureCount: tokens.length };
    }
  }

  /**
   * Desuscribe tokens de un topic
   */
  async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<{ successCount: number; failureCount: number }> {
    const messaging = getMessaging();

    if (!messaging) {
      return { successCount: 0, failureCount: tokens.length };
    }

    try {
      const response = await messaging.unsubscribeFromTopic(tokens, topic);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error('Failed to unsubscribe from topic', { error, topic });
      return { successCount: 0, failureCount: tokens.length };
    }
  }
}

