import { Router, Request, Response } from 'express';
import { DeliveryService } from './deliveryService';

export function createDeliveryRoutes(deliveryService: DeliveryService): Router {
  const router = Router();

  // Get all deliveries
  router.get('/deliveries', async (req: Request, res: Response) => {
    try {
      const deliveries = deliveryService.getDeliveries();
      res.json(deliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  });

  // Get specific delivery
  router.get('/deliveries/:id', async (req: Request, res: Response) => {
    try {
      const deliveryId = req.params.id;
      const delivery = deliveryService.getDelivery(deliveryId);
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }

      res.json(delivery);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      res.status(500).json({ error: 'Failed to fetch delivery' });
    }
  });

  // Get delivery by order ID
  router.get('/deliveries/order/:orderId', async (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderId;
      const delivery = deliveryService.getDeliveryByOrder(orderId);
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found for this order' });
      }

      res.json(delivery);
    } catch (error) {
      console.error('Error fetching delivery by order:', error);
      res.status(500).json({ error: 'Failed to fetch delivery' });
    }
  });

  // Get all drivers
  router.get('/drivers', async (req: Request, res: Response) => {
    try {
      const drivers = deliveryService.getDrivers();
      res.json(drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({ error: 'Failed to fetch drivers' });
    }
  });

  // Get specific driver
  router.get('/drivers/:id', async (req: Request, res: Response) => {
    try {
      const driverId = req.params.id;
      const driver = deliveryService.getDriver(driverId);
      
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json(driver);
    } catch (error) {
      console.error('Error fetching driver:', error);
      res.status(500).json({ error: 'Failed to fetch driver' });
    }
  });

  // Get delivery statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = deliveryService.getDeliveryStats();
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
      service: 'delivery-service',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}