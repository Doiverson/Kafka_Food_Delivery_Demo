import { Location } from './types';

export class LocationSimulator {
  private static readonly TOKYO_CENTER = { lat: 35.6762, lng: 139.6503 };
  private static readonly SIMULATION_RADIUS = 0.01; // Approximately 1km

  static generateRandomLocation(): Location {
    const lat = this.TOKYO_CENTER.lat + (Math.random() - 0.5) * this.SIMULATION_RADIUS;
    const lng = this.TOKYO_CENTER.lng + (Math.random() - 0.5) * this.SIMULATION_RADIUS;
    
    return {
      latitude: lat,
      longitude: lng,
      timestamp: new Date()
    };
  }

  static generateRouteToDestination(start: Location, destination: Location, steps: number = 10): Location[] {
    const route: Location[] = [];
    
    const latStep = (destination.latitude - start.latitude) / steps;
    const lngStep = (destination.longitude - start.longitude) / steps;
    
    for (let i = 0; i <= steps; i++) {
      // Add some randomness to make it more realistic
      const randomLat = (Math.random() - 0.5) * 0.0005;
      const randomLng = (Math.random() - 0.5) * 0.0005;
      
      route.push({
        latitude: start.latitude + (latStep * i) + randomLat,
        longitude: start.longitude + (lngStep * i) + randomLng,
        timestamp: new Date(Date.now() + i * 1000 * 30) // 30 seconds between each point
      });
    }
    
    return route;
  }

  static moveTowardsDestination(current: Location, destination: Location, speedKmh: number = 30): Location {
    const earthRadius = 6371; // km
    const distance = this.calculateDistance(current, destination);
    
    if (distance < 0.01) { // Less than 10 meters
      return destination;
    }
    
    // Calculate movement in one step (demo: updates every 1 second)
    const timeStepHours = 1 / 3600; // 1 second in hours
    const maxMovementKm = speedKmh * timeStepHours;
    
    const movementRatio = Math.min(maxMovementKm / distance, 1);
    
    const latDiff = destination.latitude - current.latitude;
    const lngDiff = destination.longitude - current.longitude;
    
    // Add some randomness for realistic movement
    const randomFactor = 0.0001;
    const randomLat = (Math.random() - 0.5) * randomFactor;
    const randomLng = (Math.random() - 0.5) * randomFactor;
    
    return {
      latitude: current.latitude + (latDiff * movementRatio) + randomLat,
      longitude: current.longitude + (lngDiff * movementRatio) + randomLng,
      timestamp: new Date()
    };
  }

  static calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Generate realistic restaurant locations in Tokyo
  static getRestaurantLocation(restaurantId: string): Location {
    const locations: Record<string, Location> = {
      'rest-1': { latitude: 35.6586, longitude: 139.7454, timestamp: new Date() }, // Shibuya
      'rest-2': { latitude: 35.6739, longitude: 139.7658, timestamp: new Date() }, // Ginza
      'rest-3': { latitude: 35.6702, longitude: 139.7037, timestamp: new Date() }, // Harajuku
    };
    
    return locations[restaurantId] || this.generateRandomLocation();
  }

  // Generate realistic customer delivery locations
  static getCustomerLocation(customerId: string): Location {
    // In a real app, this would come from customer address
    // For demo, generate random locations around Tokyo
    return this.generateRandomLocation();
  }
}