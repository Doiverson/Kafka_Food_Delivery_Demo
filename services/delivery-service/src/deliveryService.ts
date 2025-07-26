import { 
  Order, 
  OrderStatus, 
  OrderStatusEvent, 
  Delivery, 
  DeliveryStatus, 
  DeliveryDriver, 
  Location, 
  DeliveryLocationEvent 
} from './types';
import { KafkaService } from './kafka';
import { LocationSimulator } from './locationSimulator';
import { v4 as uuidv4 } from 'uuid';

export class DeliveryService {
  private deliveries: Map<string, Delivery> = new Map();
  private drivers: Map<string, DeliveryDriver> = new Map();
  private locationIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(private kafkaService: KafkaService) {
    this.initializeDrivers();
  }

  private initializeDrivers(): void {
    const mockDrivers: DeliveryDriver[] = [
      {
        id: 'driver-1',
        name: 'Tanaka San',
        phone: '090-1234-5678',
        vehicleType: 'motorcycle',
        isAvailable: true,
        currentLocation: LocationSimulator.generateRandomLocation()
      },
      {
        id: 'driver-2',
        name: 'Suzuki San',
        phone: '090-2345-6789',
        vehicleType: 'bike',
        isAvailable: true,
        currentLocation: LocationSimulator.generateRandomLocation()
      },
      {
        id: 'driver-3',
        name: 'Sato San',
        phone: '090-3456-7890',
        vehicleType: 'car',
        isAvailable: true,
        currentLocation: LocationSimulator.generateRandomLocation()
      }
    ];

    mockDrivers.forEach(driver => {
      this.drivers.set(driver.id, driver);
    });

    console.log(`Initialized ${mockDrivers.length} delivery drivers`);
  }

  async initialize(): Promise<void> {
    await this.kafkaService.subscribe('order-status', this.handleOrderStatusUpdate.bind(this));
    console.log('Delivery service initialized and subscribed to order-status topic');
  }

  private async handleOrderStatusUpdate(statusEvent: OrderStatusEvent): Promise<void> {
    if (statusEvent.status === OrderStatus.READY && statusEvent.serviceId === 'restaurant-service') {
      console.log(`Order ${statusEvent.orderId} is ready for pickup - assigning driver`);
      await this.assignDriver(statusEvent.orderId);
    }
  }

  private async assignDriver(orderId: string): Promise<void> {
    const availableDriver = this.findAvailableDriver();
    
    if (!availableDriver) {
      console.log(`No available drivers for order ${orderId}`);
      return;
    }

    const deliveryId = uuidv4();
    const restaurantLocation = LocationSimulator.getRestaurantLocation('rest-1'); // Simplified
    const customerLocation = LocationSimulator.getCustomerLocation('customer-1'); // Simplified
    
    const totalDistanceToRestaurant = LocationSimulator.calculateDistance(
      availableDriver.currentLocation,
      restaurantLocation
    );
    const totalDistanceToCustomer = LocationSimulator.calculateDistance(
      restaurantLocation,
      customerLocation
    );

    const delivery: Delivery = {
      id: deliveryId,
      orderId: orderId,
      driverId: availableDriver.id,
      status: DeliveryStatus.ASSIGNED,
      assignedAt: new Date(),
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      route: LocationSimulator.generateRouteToDestination(
        availableDriver.currentLocation,
        restaurantLocation
      ),
      currentLocation: availableDriver.currentLocation,
      // Progress tracking
      startLocation: availableDriver.currentLocation,
      restaurantLocation: restaurantLocation,
      customerLocation: customerLocation,
      totalDistanceToRestaurant: totalDistanceToRestaurant,
      totalDistanceToCustomer: totalDistanceToCustomer,
      progressPercentage: 0
    };

    // Mark driver as unavailable
    availableDriver.isAvailable = false;
    this.drivers.set(availableDriver.id, availableDriver);

    // Store delivery
    this.deliveries.set(deliveryId, delivery);

    console.log(`Driver ${availableDriver.name} assigned to order ${orderId}`);

    // Calculate initial progress
    delivery.progressPercentage = this.calculateProgressPercentage(delivery);
    console.log(`Initial progress for delivery ${delivery.id}: ${delivery.progressPercentage?.toFixed(1)}%`);

    // Start delivery simulation
    this.startDeliverySimulation(delivery);
  }

  private findAvailableDriver(): DeliveryDriver | null {
    for (const driver of this.drivers.values()) {
      if (driver.isAvailable) {
        return driver;
      }
    }
    return null;
  }

  private async startDeliverySimulation(delivery: Delivery): Promise<void> {
    console.log(`Starting delivery simulation for delivery ${delivery.id}`);
    
    // Phase 1: Go to restaurant
    await this.simulateToRestaurant(delivery);
    
    // Phase 2: Pick up order
    await this.simulatePickup(delivery);
    
    // Phase 3: Go to customer
    await this.simulateToCustomer(delivery);
    
    // Phase 4: Complete delivery
    await this.simulateDelivery(delivery);
  }

  private async simulateToRestaurant(delivery: Delivery): Promise<void> {
    return new Promise((resolve) => {
      delivery.status = DeliveryStatus.EN_ROUTE_TO_RESTAURANT;
      const restaurantLocation = LocationSimulator.getRestaurantLocation('rest-1');
      
      const interval = setInterval(async () => {
        const currentDelivery = this.deliveries.get(delivery.id);
        if (!currentDelivery || currentDelivery.status === DeliveryStatus.DELIVERED) {
          clearInterval(interval);
          this.locationIntervals.delete(delivery.id);
          return;
        }

        // Move towards restaurant (demo speed)
        const newLocation = LocationSimulator.moveTowardsDestination(
          currentDelivery.currentLocation,
          restaurantLocation,
          1000 // 1000 km/h ultra demo speed
        );

        currentDelivery.currentLocation = newLocation;
        currentDelivery.progressPercentage = this.calculateProgressPercentage(currentDelivery);
        this.deliveries.set(delivery.id, currentDelivery);

        console.log(`Progress for delivery ${delivery.id}: ${currentDelivery.progressPercentage?.toFixed(1)}%`);

        // Publish location update
        await this.publishLocationUpdate(currentDelivery);

        // Check if arrived at restaurant
        const distance = LocationSimulator.calculateDistance(newLocation, restaurantLocation);
        if (distance < 0.05) { // Within 50 meters
          clearInterval(interval);
          this.locationIntervals.delete(delivery.id); // Properly remove from map
          currentDelivery.status = DeliveryStatus.AT_RESTAURANT;
          this.deliveries.set(delivery.id, currentDelivery);
          console.log(`Driver arrived at restaurant for delivery ${delivery.id}`);
          
          // Wait at restaurant for demo
          setTimeout(() => resolve(), 500); // 2秒 → 0.5秒
        }
      }, 1000); // Update every 1 second (3秒 → 1秒)

      this.locationIntervals.set(delivery.id, interval);
    });
  }

  private async simulatePickup(delivery: Delivery): Promise<void> {
    delivery.status = DeliveryStatus.PICKED_UP;
    delivery.pickedUpAt = new Date();
    delivery.progressPercentage = this.calculateProgressPercentage(delivery);
    this.deliveries.set(delivery.id, delivery);
    console.log(`Pickup progress for delivery ${delivery.id}: ${delivery.progressPercentage?.toFixed(1)}%`);

    // Update order status to PICKED_UP
    const pickupEvent: OrderStatusEvent = {
      orderId: delivery.orderId,
      status: OrderStatus.PICKED_UP,
      timestamp: new Date(),
      serviceId: 'delivery-service',
      metadata: {
        deliveryId: delivery.id,
        driverId: delivery.driverId
      }
    };

    await this.kafkaService.publishMessage('order-status', pickupEvent);
    console.log(`Order ${delivery.orderId} picked up by driver`);
  }

  private async simulateToCustomer(delivery: Delivery): Promise<void> {
    return new Promise((resolve) => {
      delivery.status = DeliveryStatus.EN_ROUTE_TO_CUSTOMER;
      const customerLocation = LocationSimulator.getCustomerLocation('customer-1');
      
      const interval = setInterval(async () => {
        const currentDelivery = this.deliveries.get(delivery.id);
        if (!currentDelivery || currentDelivery.status === DeliveryStatus.DELIVERED) {
          clearInterval(interval);
          this.locationIntervals.delete(delivery.id + '-customer');
          return;
        }

        // Move towards customer (demo speed)
        const newLocation = LocationSimulator.moveTowardsDestination(
          currentDelivery.currentLocation,
          customerLocation,
          1000 // 1000 km/h ultra demo speed
        );

        currentDelivery.currentLocation = newLocation;
        currentDelivery.progressPercentage = this.calculateProgressPercentage(currentDelivery);
        this.deliveries.set(delivery.id, currentDelivery);

        console.log(`Progress for delivery ${delivery.id}: ${currentDelivery.progressPercentage?.toFixed(1)}%`);

        // Publish location update
        await this.publishLocationUpdate(currentDelivery);

        // Check if arrived at customer
        const distance = LocationSimulator.calculateDistance(newLocation, customerLocation);
        if (distance < 0.02) { // Within 20 meters
          clearInterval(interval);
          this.locationIntervals.delete(delivery.id + '-customer'); // Properly remove from map
          console.log(`Driver arrived at customer location for delivery ${delivery.id}`);
          setTimeout(() => resolve(), 500); // 1秒 → 0.5秒
        }
      }, 1000); // Update every 1 second (3秒 → 1秒)

      this.locationIntervals.set(delivery.id + '-customer', interval);
    });
  }

  private async simulateDelivery(delivery: Delivery): Promise<void> {
    // Clean up all intervals immediately
    this.cleanupDeliveryIntervals(delivery.id);
    
    delivery.status = DeliveryStatus.DELIVERED;
    delivery.deliveredAt = new Date();
    this.deliveries.set(delivery.id, delivery);

    // Update order status to DELIVERED
    const deliveredEvent: OrderStatusEvent = {
      orderId: delivery.orderId,
      status: OrderStatus.DELIVERED,
      timestamp: new Date(),
      serviceId: 'delivery-service',
      metadata: {
        deliveryId: delivery.id,
        driverId: delivery.driverId,
        deliveredAt: delivery.deliveredAt
      }
    };

    await this.kafkaService.publishMessage('order-status', deliveredEvent);

    // Mark driver as available again
    const driver = this.drivers.get(delivery.driverId);
    if (driver) {
      driver.isAvailable = true;
      driver.currentLocation = delivery.currentLocation;
      this.drivers.set(driver.id, driver);
    }

    console.log(`Order ${delivery.orderId} delivered successfully!`);
  }

  private cleanupDeliveryIntervals(deliveryId: string): void {
    // Clear all possible intervals for this delivery
    const intervals = [
      this.locationIntervals.get(deliveryId),
      this.locationIntervals.get(deliveryId + '-customer')
    ];
    
    intervals.forEach(interval => {
      if (interval) {
        clearInterval(interval);
      }
    });
    
    this.locationIntervals.delete(deliveryId);
    this.locationIntervals.delete(deliveryId + '-customer');
    
    console.log(`Cleaned up all location tracking for delivery ${deliveryId}`);
  }

  private calculateProgressPercentage(delivery: Delivery): number {
    const status = delivery.status;
    
    switch (status) {
      case DeliveryStatus.ASSIGNED:
        return 5;
        
      case DeliveryStatus.EN_ROUTE_TO_RESTAURANT: {
        // Calculate progress from start to restaurant (5% to 40%)
        const distanceFromStart = LocationSimulator.calculateDistance(
          delivery.startLocation,
          delivery.currentLocation
        );
        const progressToRestaurant = Math.min(distanceFromStart / delivery.totalDistanceToRestaurant, 1);
        const result = 5 + (progressToRestaurant * 35); // 5% to 40%
        console.log(`EN_ROUTE_TO_RESTAURANT - Distance from start: ${distanceFromStart.toFixed(4)}, Total: ${delivery.totalDistanceToRestaurant.toFixed(4)}, Progress: ${progressToRestaurant.toFixed(3)}, Result: ${result.toFixed(1)}%`);
        return result;
      }
      
      case DeliveryStatus.AT_RESTAURANT:
        return 45;
        
      case DeliveryStatus.PICKED_UP:
        return 50;
        
      case DeliveryStatus.EN_ROUTE_TO_CUSTOMER: {
        // Calculate progress from restaurant to customer (50% to 95%)
        const distanceFromRestaurant = LocationSimulator.calculateDistance(
          delivery.restaurantLocation,
          delivery.currentLocation
        );
        const progressToCustomer = Math.min(distanceFromRestaurant / delivery.totalDistanceToCustomer, 1);
        const result = 50 + (progressToCustomer * 45); // 50% to 95%
        console.log(`EN_ROUTE_TO_CUSTOMER - Distance from restaurant: ${distanceFromRestaurant.toFixed(4)}, Total: ${delivery.totalDistanceToCustomer.toFixed(4)}, Progress: ${progressToCustomer.toFixed(3)}, Result: ${result.toFixed(1)}%`);
        return result;
      }
      
      case DeliveryStatus.DELIVERED:
        return 100;
        
      default:
        return 0;
    }
  }

  private async publishLocationUpdate(delivery: Delivery): Promise<void> {
    const locationEvent: DeliveryLocationEvent = {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      driverId: delivery.driverId,
      latitude: delivery.currentLocation.latitude,
      longitude: delivery.currentLocation.longitude,
      timestamp: new Date(),
      metadata: {
        status: delivery.status,
        speed: Math.random() * 30 + 10, // Random speed between 10-40 km/h
        accuracy: Math.random() * 10 + 5 // Random accuracy between 5-15 meters
      }
    };

    await this.kafkaService.publishMessage('delivery-location', locationEvent);
  }

  // API methods
  getDeliveries(): Delivery[] {
    const deliveries = Array.from(this.deliveries.values());
    // Ensure progressPercentage is calculated for all deliveries
    return deliveries.map(delivery => ({
      ...delivery,
      progressPercentage: this.calculateProgressPercentage(delivery)
    }));
  }

  getDelivery(deliveryId: string): Delivery | undefined {
    return this.deliveries.get(deliveryId);
  }

  getDeliveryByOrder(orderId: string): Delivery | undefined {
    for (const delivery of this.deliveries.values()) {
      if (delivery.orderId === orderId) {
        return {
          ...delivery,
          progressPercentage: this.calculateProgressPercentage(delivery)
        };
      }
    }
    return undefined;
  }

  getDrivers(): DeliveryDriver[] {
    return Array.from(this.drivers.values());
  }

  getDriver(driverId: string): DeliveryDriver | undefined {
    return this.drivers.get(driverId);
  }

  getDeliveryStats(): { total: number; byStatus: Record<string, number>; availableDrivers: number } {
    const deliveries = Array.from(this.deliveries.values());
    const byStatus: Record<string, number> = {};
    
    deliveries.forEach(delivery => {
      byStatus[delivery.status] = (byStatus[delivery.status] || 0) + 1;
    });

    const availableDrivers = Array.from(this.drivers.values())
      .filter(driver => driver.isAvailable).length;

    return {
      total: deliveries.length,
      byStatus,
      availableDrivers,
    };
  }
}