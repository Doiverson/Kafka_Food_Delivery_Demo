import axios from 'axios';
import { Order, CreateOrderRequest, Restaurant, DeliveryDriver, Delivery, OrderStats, DeliveryStats } from '@/types';

const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:3001';
const RESTAURANT_SERVICE_URL = process.env.NEXT_PUBLIC_RESTAURANT_SERVICE_URL || 'http://localhost:3002';  
const DELIVERY_SERVICE_URL = process.env.NEXT_PUBLIC_DELIVERY_SERVICE_URL || 'http://localhost:3003';

// Order Service API
export const orderApi = {
  createOrder: async (orderRequest: CreateOrderRequest): Promise<Order> => {
    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, orderRequest);
    return response.data;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${orderId}`);
    return response.data;
  },

  getOrders: async (customerId?: string): Promise<Order[]> => {
    const params = customerId ? { customerId } : {};
    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, { params });
    return response.data;
  },

  getOrderStats: async (): Promise<OrderStats> => {
    const response = await axios.get(`${ORDER_SERVICE_URL}/api/stats`);
    return response.data;
  },
};

// Restaurant Service API
export const restaurantApi = {
  getRestaurants: async (): Promise<Restaurant[]> => {
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants`);
    return response.data;
  },

  getRestaurant: async (restaurantId: string): Promise<Restaurant> => {
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`);
    return response.data;
  },

  getRestaurantOrders: async (restaurantId?: string): Promise<Order[]> => {
    const params = restaurantId ? { restaurantId } : {};
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/orders`, { params });
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    await axios.patch(`${RESTAURANT_SERVICE_URL}/api/orders/${orderId}/status`, { status });
  },

  acceptOrder: async (orderId: string): Promise<void> => {
    await axios.post(`${RESTAURANT_SERVICE_URL}/api/orders/${orderId}/accept`);
  },

  startPreparation: async (orderId: string): Promise<void> => {
    await axios.post(`${RESTAURANT_SERVICE_URL}/api/orders/${orderId}/prepare`);
  },

  markReady: async (orderId: string): Promise<void> => {
    await axios.post(`${RESTAURANT_SERVICE_URL}/api/orders/${orderId}/ready`);
  },

  getRestaurantStats: async (): Promise<OrderStats & { byRestaurant: Record<string, number> }> => {
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/stats`);
    return response.data;
  },
};

// Delivery Service API
export const deliveryApi = {
  getDeliveries: async (): Promise<Delivery[]> => {
    const response = await axios.get(`${DELIVERY_SERVICE_URL}/api/deliveries`);
    return response.data;
  },

  getDelivery: async (deliveryId: string): Promise<Delivery> => {
    const response = await axios.get(`${DELIVERY_SERVICE_URL}/api/deliveries/${deliveryId}`);
    return response.data;
  },

  getDeliveryByOrder: async (orderId: string): Promise<Delivery> => {
    const response = await axios.get(`${DELIVERY_SERVICE_URL}/api/deliveries/order/${orderId}`);
    return response.data;
  },

  getDrivers: async (): Promise<DeliveryDriver[]> => {
    const response = await axios.get(`${DELIVERY_SERVICE_URL}/api/drivers`);
    return response.data;
  },

  getDriver: async (driverId: string): Promise<DeliveryDriver> => {
    const response = await axios.get(`${DELIVERY_SERVICE_URL}/api/drivers/${driverId}`);
    return response.data;
  },

  getDeliveryStats: async (): Promise<DeliveryStats> => {
    const response = await axios.get(`${DELIVERY_SERVICE_URL}/api/stats`);
    return response.data;
  },
};