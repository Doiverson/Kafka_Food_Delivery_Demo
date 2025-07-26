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

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  preparationTime: number;
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

export interface Delivery {
  id: string;
  orderId: string;
  driverId: string;
  status: DeliveryStatus;
  assignedAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryTime: Date;
  currentLocation: Location;
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

export interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
  restaurantId: string;
}

export interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
}

export interface DeliveryStats {
  total: number;
  byStatus: Record<string, number>;
  availableDrivers: number;
}