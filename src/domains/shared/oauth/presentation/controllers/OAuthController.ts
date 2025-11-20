/**
 * Controller para OAuth2 endpoints
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { OAuthAuthorizationService } from '../../application/services/OAuthAuthorizationService';
import { OAuthTokenService } from '../../application/services/OAuthTokenService';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { verifyClientSecret } from '../../../../../shared/utils/crypto.util';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class OAuthController {
  constructor(
    @inject(TYPES.OAuthAuthorizationService) private authorizationService: OAuthAuthorizationService,
    @inject(TYPES.OAuthTokenService) private tokenService: OAuthTokenService,
    @inject(TYPES.IOAuthClientRepository) private clientRepository: IOAuthClientRepository
  ) {}

  /**
   * GET /oauth/authorize - Authorization Code Flow
   */
  async authorize(req: Request, res: Response): Promise<void> {
    try {
      const { client_id, redirect_uri, response_type, scope, state } = req.query;

      // Validar parámetros requeridos
      if (!client_id || !redirect_uri || !response_type) {
        res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing required parameters',
        });
        return;
      }

      // Validar solicitud
      await this.authorizationService.validateAuthorizationRequest({
        client_id: client_id as string,
        redirect_uri: redirect_uri as string,
        response_type: response_type as string,
        scope: (scope as string) || 'read write',
        state: state as string,
      });

      // TODO: Aquí normalmente se mostraría una página de login/consent
      // Por ahora, asumimos que el usuario ya está autenticado
      const user_id = req.user?.id;

      if (!user_id) {
        res.status(401).json({
          error: 'unauthorized',
          error_description: 'User must be authenticated',
        });
        return;
      }

      // Generar authorization code
      const code = await this.authorizationService.generateAuthorizationCode(
        client_id as string,
        user_id,
        redirect_uri as string,
        (scope as string) || 'read write'
      );

      // Redirigir con code
      const redirectUrl = new URL(redirect_uri as string);
      redirectUrl.searchParams.set('code', code);
      if (state) {
        redirectUrl.searchParams.set('state', state as string);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('Error in OAuth authorize', { error });
      if (error instanceof Error) {
        res.status(400).json({
          error: 'invalid_request',
          error_description: error.message,
        });
        return;
      }
      res.status(500).json({
        error: 'server_error',
        error_description: 'Internal server error',
      });
    }
  }

  /**
   * POST /oauth/token - Token endpoint
   */
  async token(req: Request, res: Response): Promise<void> {
    try {
      const { grant_type, code, redirect_uri, client_id, client_secret, refresh_token } = req.body;

      if (!grant_type) {
        res.status(400).json({
          error: 'invalid_request',
          error_description: 'grant_type is required',
        });
        return;
      }

      // Validar client credentials
      if (!client_id || !client_secret) {
        res.status(401).json({
          error: 'invalid_client',
          error_description: 'client_id and client_secret are required',
        });
        return;
      }

      const client = await this.clientRepository.findByClientId(client_id);
      if (!client || !client.isActive()) {
        res.status(401).json({
          error: 'invalid_client',
          error_description: 'Invalid client credentials',
        });
        return;
      }

      // Verificar client_secret
      const isValidSecret = await verifyClientSecret(client_secret, client.client_secret_hash);
      if (!isValidSecret) {
        res.status(401).json({
          error: 'invalid_client',
          error_description: 'Invalid client credentials',
        });
        return;
      }

      let tokenResponse;

      switch (grant_type) {
        case 'authorization_code':
          if (!code || !redirect_uri) {
            res.status(400).json({
              error: 'invalid_request',
              error_description: 'code and redirect_uri are required',
            });
            return;
          }

          const { user_id, scope } = await this.authorizationService.exchangeCodeForTokens(
            code,
            client_id,
            redirect_uri
          );

          tokenResponse = await this.tokenService.generateTokensForUser(client_id, user_id, scope);
          break;

        case 'client_credentials':
          if (!client.supportsGrantType('client_credentials')) {
            res.status(400).json({
              error: 'unsupported_grant_type',
              error_description: 'Client does not support client_credentials grant',
            });
            return;
          }

          tokenResponse = await this.tokenService.generateTokenForClient(
            client_id,
            req.body.scope || 'read write'
          );
          break;

        case 'refresh_token':
          if (!refresh_token) {
            res.status(400).json({
              error: 'invalid_request',
              error_description: 'refresh_token is required',
            });
            return;
          }

          tokenResponse = await this.tokenService.refreshAccessToken(refresh_token);
          break;

        default:
          res.status(400).json({
            error: 'unsupported_grant_type',
            error_description: `Grant type "${grant_type}" is not supported`,
          });
          return;
      }

      res.status(200).json(tokenResponse);
    } catch (error) {
      logger.error('Error in OAuth token', { error });
      if (error instanceof Error) {
        res.status(400).json({
          error: 'invalid_request',
          error_description: error.message,
        });
        return;
      }
      res.status(500).json({
        error: 'server_error',
        error_description: 'Internal server error',
      });
    }
  }
}

