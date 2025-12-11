/**
 * Unit Tests para Navigation Links Generator
 */

import {
  generateGoogleMapsUrl,
  generateWazeUrl,
  generateAppleMapsUrl,
  generateUniversalUrl,
  generateNavigationLinks,
  generateNavigationLink,
  createDestinationFromCoords,
  createDestinationFromAddress,
  NavigationDestination,
} from '../../navigation-links';

describe('Navigation Links Generator', () => {
  const LIMA_COORDS = { lat: -12.0464, lng: -77.0428 };
  const CUSCO_COORDS = { lat: -13.5320, lng: -71.9675 };

  const destinationWithCoords: NavigationDestination = {
    coordinates: LIMA_COORDS,
    label: 'Cliente Lima',
  };

  const destinationWithAddress: NavigationDestination = {
    address: {
      fullAddress: 'Av. Javier Prado 1234, Lima, Perú',
    },
    label: 'Oficina Principal',
  };

  const destinationWithPartialAddress: NavigationDestination = {
    address: {
      street: 'Av. Javier Prado 1234',
      city: 'Lima',
      state: 'Lima',
      country: 'Perú',
    },
  };

  describe('generateGoogleMapsUrl', () => {
    it('should generate URL with coordinates', () => {
      const url = generateGoogleMapsUrl(destinationWithCoords);

      expect(url).toContain('https://www.google.com/maps/dir/');
      expect(url).toContain('destination=-12.0464%2C-77.0428');
    });

    it('should generate URL with full address', () => {
      const url = generateGoogleMapsUrl(destinationWithAddress);

      expect(url).toContain('https://www.google.com/maps/dir/');
      expect(url).toContain('Av.+Javier+Prado+1234');
    });

    it('should generate URL with partial address', () => {
      const url = generateGoogleMapsUrl(destinationWithPartialAddress);

      expect(url).toContain('Lima');
      expect(url).toContain('Per');
    });

    it('should include origin when provided', () => {
      const url = generateGoogleMapsUrl(destinationWithCoords, {
        origin: CUSCO_COORDS,
      });

      expect(url).toContain('origin=-13.532%2C-71.9675');
    });

    it('should include travel mode when provided', () => {
      const url = generateGoogleMapsUrl(destinationWithCoords, {
        travelMode: 'driving',
      });

      expect(url).toContain('travelmode=driving');
    });
  });

  describe('generateWazeUrl', () => {
    it('should generate URL with coordinates', () => {
      const url = generateWazeUrl(destinationWithCoords);

      expect(url).toContain('https://www.waze.com/ul');
      expect(url).toContain('ll=-12.0464%2C-77.0428');
      expect(url).toContain('navigate=yes');
    });

    it('should generate URL with address (search mode)', () => {
      const url = generateWazeUrl(destinationWithAddress);

      expect(url).toContain('https://www.waze.com/ul');
      expect(url).toContain('q=');
      expect(url).toContain('navigate=yes');
    });

    it('should use search for partial address', () => {
      const url = generateWazeUrl(destinationWithPartialAddress);

      expect(url).toContain('q=');
      expect(url).toContain('Lima');
    });
  });

  describe('generateAppleMapsUrl', () => {
    it('should generate URL with coordinates', () => {
      const url = generateAppleMapsUrl(destinationWithCoords);

      expect(url).toContain('https://maps.apple.com/');
      expect(url).toContain('daddr=-12.0464%2C-77.0428');
    });

    it('should generate URL with address', () => {
      const url = generateAppleMapsUrl(destinationWithAddress);

      expect(url).toContain('https://maps.apple.com/');
      expect(url).toContain('daddr=');
    });

    it('should include origin when provided', () => {
      const url = generateAppleMapsUrl(destinationWithCoords, {
        origin: CUSCO_COORDS,
      });

      expect(url).toContain('saddr=-13.532%2C-71.9675');
    });

    it('should include driving mode', () => {
      const url = generateAppleMapsUrl(destinationWithCoords, {
        travelMode: 'driving',
      });

      expect(url).toContain('dirflg=d');
    });

    it('should include walking mode', () => {
      const url = generateAppleMapsUrl(destinationWithCoords, {
        travelMode: 'walking',
      });

      expect(url).toContain('dirflg=w');
    });

    it('should include transit mode', () => {
      const url = generateAppleMapsUrl(destinationWithCoords, {
        travelMode: 'transit',
      });

      expect(url).toContain('dirflg=r');
    });
  });

  describe('generateUniversalUrl', () => {
    it('should generate geo: URL with coordinates', () => {
      const url = generateUniversalUrl(destinationWithCoords);

      expect(url).toContain('geo:-12.0464,-77.0428');
      expect(url).toContain('q=-12.0464,-77.0428');
    });

    it('should include label when provided', () => {
      const url = generateUniversalUrl(destinationWithCoords);

      expect(url).toContain('Cliente%20Lima');
    });

    it('should generate geo: URL with address', () => {
      const url = generateUniversalUrl(destinationWithAddress);

      expect(url).toContain('geo:0,0');
      expect(url).toContain('q=');
    });

    it('should throw error if no coordinates or address', () => {
      expect(() => generateUniversalUrl({})).toThrow(
        'Destination must have coordinates or address'
      );
    });
  });

  describe('generateNavigationLinks', () => {
    it('should generate links for all apps', () => {
      const links = generateNavigationLinks(destinationWithCoords);

      expect(links.google_maps).toContain('google.com/maps');
      expect(links.waze).toContain('waze.com');
      expect(links.apple_maps).toContain('maps.apple.com');
      expect(links.universal).toContain('geo:');
    });

    it('should throw error for invalid destination', () => {
      expect(() => generateNavigationLinks({})).toThrow(
        'Destination must have coordinates or address'
      );
    });

    it('should pass options to all generators', () => {
      const links = generateNavigationLinks(destinationWithCoords, {
        origin: CUSCO_COORDS,
        travelMode: 'driving',
      });

      expect(links.google_maps).toContain('origin=');
      expect(links.apple_maps).toContain('saddr=');
    });
  });

  describe('generateNavigationLink', () => {
    it('should generate link for google_maps', () => {
      const link = generateNavigationLink('google_maps', destinationWithCoords);

      expect(link).toContain('google.com/maps');
    });

    it('should generate link for waze', () => {
      const link = generateNavigationLink('waze', destinationWithCoords);

      expect(link).toContain('waze.com');
    });

    it('should generate link for apple_maps', () => {
      const link = generateNavigationLink('apple_maps', destinationWithCoords);

      expect(link).toContain('maps.apple.com');
    });

    it('should throw error for unsupported app', () => {
      expect(() =>
        generateNavigationLink('unknown_app' as any, destinationWithCoords)
      ).toThrow('Unsupported navigation app');
    });
  });

  describe('validation', () => {
    it('should throw error for invalid latitude', () => {
      expect(() =>
        generateNavigationLinks({
          coordinates: { lat: 91, lng: 0 },
        })
      ).toThrow('Invalid latitude');
    });

    it('should throw error for latitude < -90', () => {
      expect(() =>
        generateNavigationLinks({
          coordinates: { lat: -91, lng: 0 },
        })
      ).toThrow('Invalid latitude');
    });

    it('should throw error for invalid longitude', () => {
      expect(() =>
        generateNavigationLinks({
          coordinates: { lat: 0, lng: 181 },
        })
      ).toThrow('Invalid longitude');
    });

    it('should throw error for longitude < -180', () => {
      expect(() =>
        generateNavigationLinks({
          coordinates: { lat: 0, lng: -181 },
        })
      ).toThrow('Invalid longitude');
    });

    it('should throw error for non-number coordinates', () => {
      expect(() =>
        generateNavigationLinks({
          coordinates: { lat: 'invalid' as any, lng: 0 },
        })
      ).toThrow('Coordinates must be numbers');
    });
  });

  describe('helper functions', () => {
    describe('createDestinationFromCoords', () => {
      it('should create destination with coordinates', () => {
        const dest = createDestinationFromCoords(-12.0464, -77.0428, 'Lima');

        expect(dest.coordinates).toEqual({ lat: -12.0464, lng: -77.0428 });
        expect(dest.label).toBe('Lima');
      });

      it('should work without label', () => {
        const dest = createDestinationFromCoords(-12.0464, -77.0428);

        expect(dest.coordinates).toEqual({ lat: -12.0464, lng: -77.0428 });
        expect(dest.label).toBeUndefined();
      });
    });

    describe('createDestinationFromAddress', () => {
      it('should create destination with address', () => {
        const dest = createDestinationFromAddress('Av. Prado 123, Lima', 'Oficina');

        expect(dest.address?.fullAddress).toBe('Av. Prado 123, Lima');
        expect(dest.label).toBe('Oficina');
      });

      it('should work without label', () => {
        const dest = createDestinationFromAddress('Av. Prado 123, Lima');

        expect(dest.address?.fullAddress).toBe('Av. Prado 123, Lima');
        expect(dest.label).toBeUndefined();
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should generate correct links for delivery to a customer', () => {
      const customerDest = createDestinationFromCoords(
        -12.1234,
        -77.0234,
        'Entrega: Juan Pérez'
      );

      const links = generateNavigationLinks(customerDest, {
        travelMode: 'driving',
      });

      // All links should be valid URLs
      expect(links.google_maps).toMatch(/^https:\/\//);
      expect(links.waze).toMatch(/^https:\/\//);
      expect(links.apple_maps).toMatch(/^https:\/\//);
      expect(links.universal).toMatch(/^geo:/);
    });

    it('should generate correct links for address-based destination', () => {
      const addressDest: NavigationDestination = {
        address: {
          street: 'Calle Falsa 123',
          city: 'Springfield',
          country: 'USA',
        },
        label: 'Casa del Cliente',
      };

      const links = generateNavigationLinks(addressDest);

      expect(links.google_maps).toContain('Springfield');
      expect(links.waze).toContain('Springfield');
      expect(links.apple_maps).toContain('Springfield');
    });
  });
});

