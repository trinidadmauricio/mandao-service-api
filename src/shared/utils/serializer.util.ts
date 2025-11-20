/**
 * Utilidad para serializar respuestas JSON con tipos especiales
 * Convierte BigInt, Decimal (Prisma), Date y otros tipos a formatos JSON-compatibles
 */

/**
 * Serializa un objeto convirtiendo tipos especiales a formatos JSON-compatibles
 * - BigInt -> number (si cabe) o string
 * - Decimal (Prisma) -> number
 * - Date -> ISO string
 * - undefined -> null (opcional, configurable)
 */
export function serializeResponse<T>(data: T, options?: {
  bigIntAsString?: boolean; // Si true, convierte BigInt a string en lugar de number
  removeUndefined?: boolean; // Si true, elimina propiedades undefined en lugar de convertirlas a null
}): T {
  const { bigIntAsString = false, removeUndefined = false } = options || {};

  if (data === null || data === undefined) {
    return data;
  }

  // Manejar BigInt
  if (typeof data === 'bigint') {
    if (bigIntAsString) {
      return data.toString() as unknown as T;
    }
    // Intentar convertir a number si es seguro
    const num = Number(data);
    if (num <= Number.MAX_SAFE_INTEGER && num >= Number.MIN_SAFE_INTEGER) {
      return num as unknown as T;
    }
    return data.toString() as unknown as T;
  }

  // Manejar Decimal de Prisma (es un objeto con métodos toNumber(), toString(), etc.)
  if (data && typeof data === 'object' && 'toNumber' in data && typeof (data as any).toNumber === 'function') {
    return (data as any).toNumber() as unknown as T;
  }

  // Manejar Date
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  // Manejar arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeResponse(item, options)) as unknown as T;
  }

  // Manejar objetos
  if (typeof data === 'object') {
    const serialized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Manejar undefined
      if (value === undefined) {
        if (!removeUndefined) {
          serialized[key] = null;
        }
        // Si removeUndefined es true, simplemente no agregamos la propiedad
        continue;
      }

      // Serializar recursivamente
      serialized[key] = serializeResponse(value, options);
    }

    return serialized as T;
  }

  // Tipos primitivos (string, number, boolean) se retornan tal cual
  return data;
}

/**
 * Middleware helper para serializar respuestas antes de enviarlas
 * Útil para usar en controllers antes de res.json()
 */
export function serializeForResponse<T>(data: T): T {
  return serializeResponse(data, {
    bigIntAsString: false, // Por defecto, convertir BigInt a number si es seguro
    removeUndefined: false, // Mantener undefined como null para consistencia
  });
}

