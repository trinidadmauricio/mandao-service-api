/**
 * Unit Tests para FCMService
 */

import 'reflect-metadata';
import { FCMService, PushNotificationPayload } from '../../FCMService';

// Mock firebase-admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
    applicationDefault: jest.fn(),
  },
  messaging: jest.fn(),
}));

// Mock firebase config
jest.mock('../../../../../config/firebase.config', () => ({
  getMessaging: jest.fn(),
  isFirebaseAvailable: jest.fn(),
}));

import { getMessaging, isFirebaseAvailable } from '../../../../../config/firebase.config';

const mockGetMessaging = getMessaging as jest.Mock;
const mockIsFirebaseAvailable = isFirebaseAvailable as jest.Mock;

describe('FCMService', () => {
  let fcmService: FCMService;
  let mockMessaging: any;

  const testPayload: PushNotificationPayload = {
    title: 'Nueva orden asignada',
    body: 'Tienes una nueva orden para entregar',
    data: {
      order_id: 'order-123',
      type: 'new_order',
    },
  };

  beforeEach(() => {
    fcmService = new FCMService();

    mockMessaging = {
      send: jest.fn(),
      sendEachForMulticast: jest.fn(),
      subscribeToTopic: jest.fn(),
      unsubscribeFromTopic: jest.fn(),
    };

    mockGetMessaging.mockReturnValue(mockMessaging);
    mockIsFirebaseAvailable.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true when Firebase is configured', () => {
      mockIsFirebaseAvailable.mockReturnValue(true);
      expect(fcmService.isAvailable()).toBe(true);
    });

    it('should return false when Firebase is not configured', () => {
      mockIsFirebaseAvailable.mockReturnValue(false);
      expect(fcmService.isAvailable()).toBe(false);
    });
  });

  describe('sendToDevice', () => {
    it('should send notification successfully', async () => {
      mockMessaging.send.mockResolvedValue('message-id-123');

      const result = await fcmService.sendToDevice('device-token-123', testPayload);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('message-id-123');
      expect(mockMessaging.send).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'device-token-123',
          notification: {
            title: testPayload.title,
            body: testPayload.body,
            imageUrl: undefined,
          },
          data: testPayload.data,
        })
      );
    });

    it('should return error when FCM is not available', async () => {
      mockGetMessaging.mockReturnValue(null);

      const result = await fcmService.sendToDevice('device-token', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('FCM not configured');
    });

    it('should return error for empty token', async () => {
      const result = await fcmService.sendToDevice('', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid device token');
    });

    it('should return error for whitespace-only token', async () => {
      const result = await fcmService.sendToDevice('   ', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid device token');
    });

    it('should handle FCM send error', async () => {
      mockMessaging.send.mockRejectedValue(new Error('Token expired'));

      const result = await fcmService.sendToDevice('invalid-token', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token expired');
    });

    it('should include optional payload fields', async () => {
      mockMessaging.send.mockResolvedValue('message-id-123');

      const payloadWithOptions: PushNotificationPayload = {
        ...testPayload,
        imageUrl: 'https://example.com/image.png',
        badge: 5,
        sound: 'custom_sound',
        channelId: 'orders_channel',
      };

      await fcmService.sendToDevice('device-token', payloadWithOptions);

      expect(mockMessaging.send).toHaveBeenCalledWith(
        expect.objectContaining({
          notification: expect.objectContaining({
            imageUrl: 'https://example.com/image.png',
          }),
          android: expect.objectContaining({
            notification: expect.objectContaining({
              channelId: 'orders_channel',
              sound: 'custom_sound',
            }),
          }),
          apns: expect.objectContaining({
            payload: expect.objectContaining({
              aps: expect.objectContaining({
                badge: 5,
                sound: 'custom_sound',
              }),
            }),
          }),
        })
      );
    });
  });

  describe('sendToMultipleDevices', () => {
    const tokens = ['token1', 'token2', 'token3'];

    it('should send to multiple devices successfully', async () => {
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 3,
        failureCount: 0,
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: true, messageId: 'msg-2' },
          { success: true, messageId: 'msg-3' },
        ],
      });

      const result = await fcmService.sendToMultipleDevices(tokens, testPayload);

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
      expect(result.responses.length).toBe(3);
      expect(result.responses.every((r) => r.success)).toBe(true);
    });

    it('should handle partial failures', async () => {
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 1,
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: false, error: { message: 'Token expired' } },
          { success: true, messageId: 'msg-3' },
        ],
      });

      const result = await fcmService.sendToMultipleDevices(tokens, testPayload);

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.responses[1].success).toBe(false);
      expect(result.responses[1].error).toBe('Token expired');
    });

    it('should return error when FCM is not available', async () => {
      mockGetMessaging.mockReturnValue(null);

      const result = await fcmService.sendToMultipleDevices(tokens, testPayload);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(3);
      expect(result.responses.every((r) => r.error === 'FCM not configured')).toBe(true);
    });

    it('should filter empty tokens', async () => {
      const tokensWithEmpty = ['token1', '', 'token3', '   '];
      mockMessaging.sendEachForMulticast.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [
          { success: true, messageId: 'msg-1' },
          { success: true, messageId: 'msg-2' },
        ],
      });

      await fcmService.sendToMultipleDevices(tokensWithEmpty, testPayload);

      // Should only send to 2 valid tokens (token1 and token3)
      expect(mockMessaging.sendEachForMulticast).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens: ['token1', 'token3'],
        })
      );
    });

    it('should return empty result for all empty tokens', async () => {
      const result = await fcmService.sendToMultipleDevices(['', '   '], testPayload);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.responses.length).toBe(0);
      expect(mockMessaging.sendEachForMulticast).not.toHaveBeenCalled();
    });

    it('should handle complete send failure', async () => {
      mockMessaging.sendEachForMulticast.mockRejectedValue(new Error('Network error'));

      const result = await fcmService.sendToMultipleDevices(tokens, testPayload);

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(3);
      expect(result.responses.every((r) => r.error === 'Network error')).toBe(true);
    });
  });

  describe('sendToTopic', () => {
    it('should send to topic successfully', async () => {
      mockMessaging.send.mockResolvedValue('message-id-123');

      const result = await fcmService.sendToTopic('new_orders', testPayload);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('message-id-123');
      expect(mockMessaging.send).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'new_orders',
        })
      );
    });

    it('should return error when FCM is not available', async () => {
      mockGetMessaging.mockReturnValue(null);

      const result = await fcmService.sendToTopic('topic', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('FCM not configured');
    });

    it('should return error for empty topic', async () => {
      const result = await fcmService.sendToTopic('', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid topic');
    });

    it('should handle topic send error', async () => {
      mockMessaging.send.mockRejectedValue(new Error('Invalid topic name'));

      const result = await fcmService.sendToTopic('invalid/topic', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid topic name');
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe tokens to topic', async () => {
      mockMessaging.subscribeToTopic.mockResolvedValue({
        successCount: 3,
        failureCount: 0,
      });

      const result = await fcmService.subscribeToTopic(
        ['token1', 'token2', 'token3'],
        'orders'
      );

      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
    });

    it('should handle subscribe when FCM not available', async () => {
      mockGetMessaging.mockReturnValue(null);

      const result = await fcmService.subscribeToTopic(['token1'], 'orders');

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe tokens from topic', async () => {
      mockMessaging.unsubscribeFromTopic.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
      });

      const result = await fcmService.unsubscribeFromTopic(['token1', 'token2'], 'orders');

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });

    it('should handle unsubscribe when FCM not available', async () => {
      mockGetMessaging.mockReturnValue(null);

      const result = await fcmService.unsubscribeFromTopic(['token1'], 'orders');

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
    });
  });
});

