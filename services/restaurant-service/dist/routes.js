"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestaurantRoutes = createRestaurantRoutes;
const express_1 = require("express");
const types_1 = require("./types");
function createRestaurantRoutes(restaurantService) {
    const router = (0, express_1.Router)();
    // Get all active orders
    router.get('/orders', async (req, res) => {
        try {
            const restaurantId = req.query.restaurantId;
            let orders;
            if (restaurantId) {
                orders = restaurantService.getOrdersByRestaurant(restaurantId);
            }
            else {
                orders = restaurantService.getActiveOrders();
            }
            res.json(orders);
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    });
    // Get specific order
    router.get('/orders/:id', async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = restaurantService.getOrder(orderId);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(order);
        }
        catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    });
    // Update order status manually
    router.patch('/orders/:id/status', async (req, res) => {
        try {
            const orderId = req.params.id;
            const { status } = req.body;
            if (!Object.values(types_1.OrderStatus).includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            const success = await restaurantService.manualUpdateOrderStatus(orderId, status);
            if (!success) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json({ success: true, message: `Order ${orderId} status updated to ${status}` });
        }
        catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: 'Failed to update order status' });
        }
    });
    // Accept order
    router.post('/orders/:id/accept', async (req, res) => {
        try {
            const orderId = req.params.id;
            await restaurantService.acceptOrder(orderId);
            res.json({ success: true, message: `Order ${orderId} accepted` });
        }
        catch (error) {
            console.error('Error accepting order:', error);
            res.status(500).json({ error: 'Failed to accept order' });
        }
    });
    // Start preparation
    router.post('/orders/:id/prepare', async (req, res) => {
        try {
            const orderId = req.params.id;
            await restaurantService.startPreparation(orderId);
            res.json({ success: true, message: `Order ${orderId} preparation started` });
        }
        catch (error) {
            console.error('Error starting preparation:', error);
            res.status(500).json({ error: 'Failed to start preparation' });
        }
    });
    // Complete preparation
    router.post('/orders/:id/ready', async (req, res) => {
        try {
            const orderId = req.params.id;
            await restaurantService.completePreparation(orderId);
            res.json({ success: true, message: `Order ${orderId} is ready for pickup` });
        }
        catch (error) {
            console.error('Error completing preparation:', error);
            res.status(500).json({ error: 'Failed to complete preparation' });
        }
    });
    // Get all restaurants
    router.get('/restaurants', async (req, res) => {
        try {
            const restaurants = restaurantService.getRestaurants();
            res.json(restaurants);
        }
        catch (error) {
            console.error('Error fetching restaurants:', error);
            res.status(500).json({ error: 'Failed to fetch restaurants' });
        }
    });
    // Get specific restaurant
    router.get('/restaurants/:id', async (req, res) => {
        try {
            const restaurantId = req.params.id;
            const restaurant = restaurantService.getRestaurant(restaurantId);
            if (!restaurant) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }
            res.json(restaurant);
        }
        catch (error) {
            console.error('Error fetching restaurant:', error);
            res.status(500).json({ error: 'Failed to fetch restaurant' });
        }
    });
    // Get order statistics
    router.get('/stats', async (req, res) => {
        try {
            const stats = restaurantService.getOrderStats();
            res.json(stats);
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    });
    // Health check
    router.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'restaurant-service',
            timestamp: new Date().toISOString()
        });
    });
    return router;
}
//# sourceMappingURL=routes.js.map