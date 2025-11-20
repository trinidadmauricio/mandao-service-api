/**
 * Script para generar el archivo JSON de Swagger
 * Ejecutar con: npx ts-node scripts/generate-swagger-json.ts
 */

import { swaggerSpec } from '../src/config/swagger.config';
import * as fs from 'fs';
import * as path from 'path';

const outputPath = path.join(__dirname, '..', 'swagger.json');

// Convertir el spec a JSON con formato legible
const jsonSpec = JSON.stringify(swaggerSpec, null, 2);

// Escribir el archivo
fs.writeFileSync(outputPath, jsonSpec, 'utf-8');

console.log(`✅ Swagger JSON generado exitosamente en: ${outputPath}`);
console.log(`📄 Tamaño del archivo: ${(jsonSpec.length / 1024).toFixed(2)} KB`);

