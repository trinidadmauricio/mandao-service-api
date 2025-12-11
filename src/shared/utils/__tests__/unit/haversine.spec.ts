/**
 * Unit Tests para Haversine Distance Calculator
 */

import {
  haversineDistance,
  sortByDistance,
  filterByRadius,
  addDistanceToItems,
  Coordinates,
} from '../../haversine';

describe('Haversine Distance Calculator', () => {
  // Coordenadas de ciudades conocidas para pruebas
  const LIMA: Coordinates = { lat: -12.0464, lng: -77.0428 };
  const CUSCO: Coordinates = { lat: -13.5320, lng: -71.9675 };
  const AREQUIPA: Coordinates = { lat: -16.4090, lng: -71.5375 };
  const NEW_YORK: Coordinates = { lat: 40.7128, lng: -74.006 };
  const LONDON: Coordinates = { lat: 51.5074, lng: -0.1278 };

  describe('haversineDistance', () => {
    describe('basic calculations', () => {
      it('should return 0 for same coordinates', () => {
        const distance = haversineDistance(LIMA, LIMA);
        expect(distance).toBe(0);
      });

      it('should return approximately correct distance for Lima to Cusco (~577 km)', () => {
        const distance = haversineDistance(LIMA, CUSCO);
        // La distancia real es aproximadamente 577 km
        expect(distance).toBeGreaterThan(550);
        expect(distance).toBeLessThan(600);
      });

      it('should return approximately correct distance for Lima to Arequipa (~783 km)', () => {
        const distance = haversineDistance(LIMA, AREQUIPA);
        // La distancia real es aproximadamente 783 km
        expect(distance).toBeGreaterThan(750);
        expect(distance).toBeLessThan(820);
      });

      it('should return approximately correct distance for New York to London (~5570 km)', () => {
        const distance = haversineDistance(NEW_YORK, LONDON);
        // La distancia real es aproximadamente 5570 km
        expect(distance).toBeGreaterThan(5500);
        expect(distance).toBeLessThan(5700);
      });

      it('should be symmetric (A to B = B to A)', () => {
        const distanceAB = haversineDistance(LIMA, CUSCO);
        const distanceBA = haversineDistance(CUSCO, LIMA);
        expect(distanceAB).toBeCloseTo(distanceBA, 10);
      });
    });

    describe('unit conversions', () => {
      it('should return distance in kilometers by default', () => {
        const distance = haversineDistance(LIMA, CUSCO);
        expect(distance).toBeGreaterThan(500); // Should be ~577 km
        expect(distance).toBeLessThan(600);
      });

      it('should return distance in miles when specified', () => {
        const distanceKm = haversineDistance(LIMA, CUSCO, { unit: 'km' });
        const distanceMiles = haversineDistance(LIMA, CUSCO, { unit: 'miles' });
        
        // 1 mile ≈ 1.609 km
        expect(distanceMiles).toBeCloseTo(distanceKm / 1.609, 0);
      });

      it('should return distance in meters when specified', () => {
        const distanceKm = haversineDistance(LIMA, CUSCO, { unit: 'km' });
        const distanceMeters = haversineDistance(LIMA, CUSCO, { unit: 'meters' });
        
        expect(distanceMeters).toBeCloseTo(distanceKm * 1000, 0);
      });
    });

    describe('validation', () => {
      it('should throw error for invalid latitude (> 90)', () => {
        expect(() =>
          haversineDistance({ lat: 91, lng: 0 }, LIMA)
        ).toThrow('Invalid latitude');
      });

      it('should throw error for invalid latitude (< -90)', () => {
        expect(() =>
          haversineDistance({ lat: -91, lng: 0 }, LIMA)
        ).toThrow('Invalid latitude');
      });

      it('should throw error for invalid longitude (> 180)', () => {
        expect(() =>
          haversineDistance({ lat: 0, lng: 181 }, LIMA)
        ).toThrow('Invalid longitude');
      });

      it('should throw error for invalid longitude (< -180)', () => {
        expect(() =>
          haversineDistance({ lat: 0, lng: -181 }, LIMA)
        ).toThrow('Invalid longitude');
      });

      it('should throw error for NaN latitude', () => {
        expect(() =>
          haversineDistance({ lat: NaN, lng: 0 }, LIMA)
        ).toThrow('Coordinates cannot be NaN');
      });

      it('should throw error for NaN longitude', () => {
        expect(() =>
          haversineDistance({ lat: 0, lng: NaN }, LIMA)
        ).toThrow('Coordinates cannot be NaN');
      });
    });

    describe('edge cases', () => {
      it('should handle coordinates at equator', () => {
        const point1 = { lat: 0, lng: 0 };
        const point2 = { lat: 0, lng: 1 };
        const distance = haversineDistance(point1, point2);
        // At equator, 1 degree longitude ≈ 111 km
        expect(distance).toBeGreaterThan(100);
        expect(distance).toBeLessThan(120);
      });

      it('should handle coordinates at poles', () => {
        const northPole = { lat: 90, lng: 0 };
        const equator = { lat: 0, lng: 0 };
        const distance = haversineDistance(northPole, equator);
        // Distance from pole to equator ≈ 10,000 km
        expect(distance).toBeGreaterThan(9900);
        expect(distance).toBeLessThan(10100);
      });

      it('should handle antipodal points', () => {
        const point1 = { lat: 0, lng: 0 };
        const point2 = { lat: 0, lng: 180 };
        const distance = haversineDistance(point1, point2);
        // Half Earth circumference at equator ≈ 20,000 km
        expect(distance).toBeGreaterThan(19900);
        expect(distance).toBeLessThan(20100);
      });
    });
  });

  describe('sortByDistance', () => {
    interface Driver {
      id: string;
      name: string;
      lat: number;
      lng: number;
    }

    const drivers: Driver[] = [
      { id: '1', name: 'Driver Cusco', lat: CUSCO.lat, lng: CUSCO.lng },
      { id: '2', name: 'Driver Lima', lat: LIMA.lat, lng: LIMA.lng },
      { id: '3', name: 'Driver Arequipa', lat: AREQUIPA.lat, lng: AREQUIPA.lng },
    ];

    it('should sort drivers by distance from reference point (Lima)', () => {
      const sorted = sortByDistance(
        drivers,
        LIMA,
        (d) => ({ lat: d.lat, lng: d.lng })
      );

      expect(sorted[0].name).toBe('Driver Lima'); // 0 km
      expect(sorted[1].name).toBe('Driver Cusco'); // ~577 km
      expect(sorted[2].name).toBe('Driver Arequipa'); // ~783 km
    });

    it('should handle items without coordinates (push to end)', () => {
      const driversWithNull = [
        ...drivers,
        { id: '4', name: 'Driver Unknown', lat: null as any, lng: null as any },
      ];

      const sorted = sortByDistance(
        driversWithNull,
        LIMA,
        (d) => (d.lat && d.lng ? { lat: d.lat, lng: d.lng } : null)
      );

      expect(sorted[sorted.length - 1].name).toBe('Driver Unknown');
    });

    it('should not mutate original array', () => {
      const original = [...drivers];
      sortByDistance(drivers, LIMA, (d) => ({ lat: d.lat, lng: d.lng }));
      expect(drivers).toEqual(original);
    });
  });

  describe('filterByRadius', () => {
    interface Location {
      id: string;
      lat: number;
      lng: number;
    }

    const locations: Location[] = [
      { id: 'lima', lat: LIMA.lat, lng: LIMA.lng },
      { id: 'cusco', lat: CUSCO.lat, lng: CUSCO.lng }, // ~577 km from Lima
      { id: 'arequipa', lat: AREQUIPA.lat, lng: AREQUIPA.lng }, // ~783 km from Lima
    ];

    it('should filter locations within radius', () => {
      // Radius 600 km should include Lima and Cusco, but not Arequipa
      const filtered = filterByRadius(
        locations,
        LIMA,
        600,
        (l) => ({ lat: l.lat, lng: l.lng })
      );

      expect(filtered.length).toBe(2);
      expect(filtered.map((l) => l.id)).toContain('lima');
      expect(filtered.map((l) => l.id)).toContain('cusco');
      expect(filtered.map((l) => l.id)).not.toContain('arequipa');
    });

    it('should return all locations within large radius', () => {
      const filtered = filterByRadius(
        locations,
        LIMA,
        1000,
        (l) => ({ lat: l.lat, lng: l.lng })
      );

      expect(filtered.length).toBe(3);
    });

    it('should return only reference point within zero radius', () => {
      const filtered = filterByRadius(
        locations,
        LIMA,
        0,
        (l) => ({ lat: l.lat, lng: l.lng })
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('lima');
    });
  });

  describe('addDistanceToItems', () => {
    interface Driver {
      id: string;
      name: string;
      lat: number;
      lng: number;
    }

    const drivers: Driver[] = [
      { id: '1', name: 'Driver Lima', lat: LIMA.lat, lng: LIMA.lng },
      { id: '2', name: 'Driver Cusco', lat: CUSCO.lat, lng: CUSCO.lng },
    ];

    it('should add distance_km to each item', () => {
      const withDistance = addDistanceToItems(
        drivers,
        LIMA,
        (d) => ({ lat: d.lat, lng: d.lng })
      );

      expect(withDistance[0].distance_km).toBe(0);
      expect(withDistance[1].distance_km).toBeGreaterThan(550);
      expect(withDistance[1].distance_km).toBeLessThan(600);
    });

    it('should set distance_km to null for items without coordinates', () => {
      const driversWithNull = [
        ...drivers,
        { id: '3', name: 'Unknown', lat: null as any, lng: null as any },
      ];

      const withDistance = addDistanceToItems(
        driversWithNull,
        LIMA,
        (d) => (d.lat && d.lng ? { lat: d.lat, lng: d.lng } : null)
      );

      expect(withDistance[2].distance_km).toBeNull();
    });

    it('should preserve original properties', () => {
      const withDistance = addDistanceToItems(
        drivers,
        LIMA,
        (d) => ({ lat: d.lat, lng: d.lng })
      );

      expect(withDistance[0].id).toBe('1');
      expect(withDistance[0].name).toBe('Driver Lima');
    });
  });
});

