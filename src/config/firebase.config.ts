/**
 * Firebase Admin SDK Configuration
 * 
 * Configura Firebase Admin para enviar push notifications a través de FCM.
 * 
 * Variables de entorno requeridas:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_PRIVATE_KEY (con \n escapados)
 * - FIREBASE_CLIENT_EMAIL
 * 
 * O alternativamente:
 * - GOOGLE_APPLICATION_CREDENTIALS (ruta al archivo JSON de servicio)
 */

import * as admin from 'firebase-admin';
import { logger } from '../shared/utils/logger';

let firebaseApp: admin.app.App | null = null;
let isInitialized = false;

/**
 * Inicializa Firebase Admin SDK
 * Maneja múltiples formas de autenticación
 */
export function initializeFirebase(): admin.app.App | null {
  if (isInitialized) {
    return firebaseApp;
  }

  try {
    // Opción 1: Variables de entorno individuales
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });

      logger.info('Firebase Admin initialized with environment credentials');
      isInitialized = true;
      return firebaseApp;
    }

    // Opción 2: Archivo de credenciales (GOOGLE_APPLICATION_CREDENTIALS)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });

      logger.info('Firebase Admin initialized with application default credentials');
      isInitialized = true;
      return firebaseApp;
    }

    // En desarrollo/test, puede funcionar sin Firebase
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      logger.warn('Firebase not configured. Push notifications will be disabled.');
      isInitialized = true;
      return null;
    }

    logger.error('Firebase credentials not found. Push notifications will not work.');
    isInitialized = true;
    return null;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    isInitialized = true;
    return null;
  }
}

/**
 * Obtiene la instancia de Firebase App
 */
export function getFirebaseApp(): admin.app.App | null {
  if (!isInitialized) {
    return initializeFirebase();
  }
  return firebaseApp;
}

/**
 * Obtiene el servicio de mensajería (FCM)
 */
export function getMessaging(): admin.messaging.Messaging | null {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  return admin.messaging(app);
}

/**
 * Verifica si Firebase está configurado y disponible
 */
export function isFirebaseAvailable(): boolean {
  return getFirebaseApp() !== null;
}

