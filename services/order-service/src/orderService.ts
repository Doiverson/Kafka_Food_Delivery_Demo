import { Order, OrderStatus, CreateOrderRequest, OrderStatusEvent } from './types';
import { KafkaService } from './kafka';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  private orders: Map<string, Order> = new Map();

  constructor(private kafkaService: KafkaService) {}

  async initialize(): Promise<void> {
    // Subscribe to order status updates
    await this.kafkaService.subscribe('order-status', this.handleOrderStatusUpdate.bind(this));
    console.log('Order service initialized and subscribed to order-status topic');
  }

  async createOrder(orderRequest: CreateOrderRequest): Promise<Order> {
    const orderId = uuidv4();
    const totalPrice = orderRequest.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order: Order = {
      id: orderId,
      customerId: orderRequest.customerId,
      items: orderRequest.items,
      totalPrice,
      restaurantId: orderRequest.restaurantId,
      status: OrderStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store order locally
    this.orders.set(orderId, order);

    // Publish to Kafka orders topic
    await this.kafkaService.publishMessage('orders', {
      ...order,
      eventType: 'ORDER_CREATED',
      timestamp: new Date().toISOString(),
    });

    console.log(`Order created: ${orderId}`);
    return order;
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    return this.orders.get(orderId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.customerId === customerId);
  }

  private async handleOrderStatusUpdate(statusEvent: OrderStatusEvent): Promise<void> {
    const order = this.orders.get(statusEvent.orderId);
    if (order) {
      // Update order status
      order.status = statusEvent.status;
      order.updatedAt = new Date();
      
      this.orders.set(order.id, order);
      
      console.log(`Order ${order.id} status updated to ${statusEvent.status} by ${statusEvent.serviceId}`);
      
      // Here you could emit to WebSocket clients for real-time updates
      this.notifyOrderUpdate(order);
    } else {
      console.warn(`Received status update for unknown order: ${statusEvent.orderId}`);
    }
  }

  private notifyOrderUpdate(order: Order): void {
    // This will be implemented when we add WebSocket support
    console.log(`Notifying clients about order update: ${order.id} -> ${order.status}`);
  }

  // Get order statistics
  getOrderStats(): { total: number; byStatus: Record<string, number> } {
    const orders = Array.from(this.orders.values());
    const byStatus: Record<string, number> = {};
    
    orders.forEach(order => {
      byStatus[order.status] = (byStatus[order.status] || 0) + 1;
    });

    return {
      total: orders.length,
      byStatus,
    };
  }
}