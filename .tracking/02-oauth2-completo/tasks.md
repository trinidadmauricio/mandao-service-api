# Tareas - OAuth2 Completo

## Tareas de Authorization Code Flow

- [x] Crear endpoint /oauth/authorize
- [x] Validar client_id y redirect_uri
- [x] Generar authorization code
- [x] Guardar code en DB con expiración
- [x] Redirigir a redirect_uri con code
- [ ] Tests unitarios

## Tareas de Token Generation

- [x] Crear endpoint /oauth/token
- [x] Validar authorization code
- [x] Generar access token (JWT)
- [x] Generar refresh token
- [x] Guardar tokens en DB
- [x] Retornar tokens al cliente
- [ ] Tests unitarios

## Tareas de Client Credentials Flow

- [x] Validar client_id y client_secret
- [x] Generar access token sin refresh
- [ ] Tests unitarios

## Tareas de Refresh Token Flow

- [x] Validar refresh token
- [x] Generar nuevo access token
- [x] Generar nuevo refresh token (rotation)
- [x] Revocar refresh token anterior
- [ ] Tests unitarios

## Tareas de OAuth Clients Management

- [x] CRUD OAuth clients
- [x] Generar client_id único
- [x] Generar client_secret seguro
- [x] Gestionar redirect_uris
- [x] Gestionar scopes
- [ ] Tests unitarios

## Tareas de Seguridad

- [x] Implementar rate limiting en /oauth/*
- [x] Validar expiración de tokens
- [x] Implementar token revocation
- [x] Secure storage de secrets
- [ ] Security audit checklist

## Tareas de Testing

- [x] Tests unitarios Authorization Code Flow
- [x] Tests unitarios Client Credentials Flow
- [x] Tests unitarios Refresh Token Flow
- [x] Tests unitarios token expiration
- [x] Tests unitarios token rotation
- [x] Tests unitarios OAuth entities
- [x] Tests unitarios OAuth services
- [x] Tests unitarios OAuth use cases
- [ ] Verificar coverage >80% (26.47% actual - se incrementará con más funcionalidad)

