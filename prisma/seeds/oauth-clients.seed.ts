/**
 * Seed para OAuth Clients de administradores del SaaS
 */

import { PrismaClient } from '@prisma/client';
import { generateClientId, generateClientSecret, hashClientSecret } from '../../src/shared/utils/crypto.util';

const prisma = new PrismaClient();

export async function seedOAuthClients(): Promise<void> {
  console.log('🌱 Seeding OAuth clients for SaaS admins...');

  const clients = [
    {
      name: 'SaaS Admin Dashboard',
      redirect_uris: [
        'http://localhost:3001/callback',
        'https://admin.mandao.com/callback',
      ],
      grant_types: ['authorization_code', 'client_credentials', 'refresh_token'],
      scope: 'admin:read admin:write tenant:read tenant:write',
      is_confidential: true,
    },
    {
      name: 'SaaS Admin API Client',
      redirect_uris: ['http://localhost:3001/callback'],
      grant_types: ['client_credentials', 'refresh_token'],
      scope: 'admin:read admin:write',
      is_confidential: true,
    },
  ];

  const createdClients: Array<{ name: string; client_id: string; client_secret: string }> = [];

  for (const clientData of clients) {
    // Verificar si ya existe un client con el mismo nombre
    const existing = await prisma.oAuthClient.findFirst({
      where: {
        name: clientData.name,
        tenant_id: null, // Solo buscar clients globales
      },
    });

    if (!existing) {
      // Generar client_id y client_secret
      const client_id = generateClientId();
      const client_secret = generateClientSecret();
      const client_secret_hash = await hashClientSecret(client_secret);

      await prisma.oAuthClient.create({
        data: {
          tenant_id: null, // Clientes globales del SaaS
          client_id,
          client_secret_hash,
          name: clientData.name,
          redirect_uris: clientData.redirect_uris,
          grant_types: clientData.grant_types,
          scope: clientData.scope,
          is_confidential: clientData.is_confidential,
          is_active: true,
        },
      });

      console.log(`  ✅ Created OAuth client: ${clientData.name}`);
      createdClients.push({
        name: clientData.name,
        client_id,
        client_secret,
      });
    } else {
      console.log(`  ⏭️  OAuth client already exists: ${clientData.name}`);
    }
  }

  if (createdClients.length > 0) {
    console.log('\n📋 OAuth Client credentials (SAVE THESE SECURELY):');
    console.log('='.repeat(60));
    createdClients.forEach((client) => {
      console.log(`Name: ${client.name}`);
      console.log(`Client ID: ${client.client_id}`);
      console.log(`Client Secret: ${client.client_secret}`);
      console.log('-'.repeat(60));
    });
    console.log('='.repeat(60));
    console.log('⚠️  These secrets will NOT be shown again!\n');
  }

  console.log('✅ OAuth clients seeded successfully\n');
}

