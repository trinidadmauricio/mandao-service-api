# Sub-plan 02: OAuth2 Completo

## Objetivo

Implementar sistema de autenticación OAuth2 propio completo con los 3 flows principales y gestión de clients.

## Alcance

Este sub-plan está integrado en la Fase 1 (Setup y Fundación) y cubre:
- Authorization Code Flow
- Client Credentials Flow  
- Refresh Token Flow
- Gestión de OAuth clients
- Token rotation y seguridad

## Entregables

1. **Authorization Code Flow**
   - Endpoint /oauth/authorize
   - Generación de authorization codes
   - Validación de redirect_uri
   - Expiración de codes (10 minutos)

2. **Token Generation**
   - Endpoint /oauth/token
   - Generación de access tokens
   - Generación de refresh tokens
   - JWT signing y verification

3. **Client Credentials Flow**
   - Soporte para machine-to-machine
   - Tokens sin refresh

4. **Refresh Token Flow**
   - Endpoint /oauth/token con grant_type=refresh_token
   - Token rotation (nuevo refresh token en cada refresh)
   - Revocación de tokens antiguos

5. **OAuth Clients Management**
   - CRUD de clients
   - Client ID y Secret generation
   - Redirect URIs management
   - Scopes management

6. **Seguridad**
   - PKCE support (opcional futuro)
   - Rate limiting en endpoints OAuth
   - Token expiration enforcement
   - Secure token storage

## Criterios de Éxito

- ✓ Authorization Code Flow funciona end-to-end
- ✓ Client Credentials Flow funciona
- ✓ Refresh Token Flow con rotation funciona
- ✓ Tests unitarios >80% coverage
- ✓ Tokens expiran correctamente
- ✓ Clients pueden gestionarse via API

## Duración Estimada

Parte de Fase 1 (Semanas 1-3)

## Dependencias

- Sub-plan 01: Setup y Fundación (estructura base, Prisma, schemas)

## Riesgos

- Complejidad de OAuth2 RFC 6749
- Seguridad crítica - requiere audit
- Token rotation puede tener edge cases

