export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalPrice: number;
  restaurantId: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED'
}

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  timestamp: Date;
  serviceId: string;
  metadata?: any;
}

export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'motorcycle' | 'car';
  isAvailable: boolean;
  currentLocation: Location;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface DeliveryLocationEvent {
  deliveryId: string;
  orderId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  metadata?: {
    status?: string;
    speed?: number;
    accuracy?: number;
    bearing?: number;
  };
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId: string;
  status: DeliveryStatus;
  assignedAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryTime: Date;
  route: Location[];
  currentLocation: Location;
  // Progress tracking
  startLocation: Location;
  restaurantLocation: Location;
  customerLocation: Location;
  totalDistanceToRestaurant: number;
  totalDistanceToCustomer: number;
  progressPercentage?: number;
}

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE_TO_RESTAURANT = 'EN_ROUTE_TO_RESTAURANT',
  AT_RESTAURANT = 'AT_RESTAURANT',
  PICKED_UP = 'PICKED_UP',
  EN_ROUTE_TO_CUSTOMER = 'EN_ROUTE_TO_CUSTOMER',
  DELIVERED = 'DELIVERED'
}