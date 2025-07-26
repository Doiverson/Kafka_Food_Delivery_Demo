import { Router, Request, Response } from 'express';
import { OrderService } from './orderService';
import { CreateOrderRequest } from './types';

export function createOrderRoutes(orderService: OrderService): Router {
  const router = Router();

  // Create new order
  router.post('/orders', async (req: Request, res: Response) => {
    try {
      const orderRequest: CreateOrderRequest = req.body;
      
      // Basic validation
      if (!orderRequest.customerId || !orderRequest.restaurantId || !orderRequest.items || orderRequest.items.length === 0) {
        return res.status(400).json({ 
          error: 'Missing required fields: customerId, restaurantId, items' 
        });
      }

      const order = await orderService.createOrder(orderRequest);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Get order by ID
  router.get('/orders/:id', async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const order = await orderService.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  // Get all orders
  router.get('/orders', async (req: Request, res: Response) => {
    try {
      const customerId = req.query.customerId as string;
      
      let orders;
      if (customerId) {
        orders = await orderService.getOrdersByCustomer(customerId);
      } else {
        orders = await orderService.getAllOrders();
      }

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Get order statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = orderService.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Health check
  router.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'healthy', 
      service: 'order-service',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}