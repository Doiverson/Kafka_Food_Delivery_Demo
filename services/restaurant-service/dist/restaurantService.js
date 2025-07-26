"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantService = void 0;
const types_1 = require("./types");
class RestaurantService {
    constructor(kafkaService) {
        this.kafkaService = kafkaService;
        this.activeOrders = new Map();
        this.restaurants = new Map();
        this.initializeRestaurants();
    }
    initializeRestaurants() {
        // Mock restaurants data
        const mockRestaurants = [
            {
                id: 'rest-1',
                name: 'Tokyo Ramen House',
                address: '1-1-1 Shibuya, Tokyo',
                phone: '03-1234-5678',
                preparationTime: 15
            },
            {
                id: 'rest-2',
                name: 'Sushi Master',
                address: '2-2-2 Ginza, Tokyo',
                phone: '03-2345-6789',
                preparationTime: 20
            },
            {
                id: 'rest-3',
                name: 'Burger Palace',
                address: '3-3-3 Harajuku, Tokyo',
                phone: '03-3456-7890',
                preparationTime: 10
            }
        ];
        mockRestaurants.forEach(restaurant => {
            this.restaurants.set(restaurant.id, restaurant);
        });
        console.log(`Initialized ${mockRestaurants.length} restaurants`);
    }
    async initialize() {
        // For now, only subscribe to orders topic to ensure restaurant service works
        // We'll handle DELIVERED status updates differently
        await this.kafkaService.subscribe('orders', this.handleNewOrder.bind(this));
        await this.kafkaService.startConsumer();
        console.log('Restaurant service initialized and subscribed to orders topic');
    }
    async handleNewOrder(orderData) {
        if (orderData.eventType === 'ORDER_CREATED') {
            const order = {
                ...orderData,
                createdAt: new Date(orderData.createdAt),
                updatedAt: new Date(orderData.updatedAt),
                restaurant: this.restaurants.get(orderData.restaurantId)
            };
            // Only handle orders for our restaurants
            if (order.restaurant) {
                this.activeOrders.set(order.id, order);
                console.log(`New order received for restaurant ${order.restaurant.name}: ${order.id}`);
                // Orders will now be processed manually via dashboard buttons
            }
        }
    }
    async acceptOrder(orderId) {
        const order = this.activeOrders.get(orderId);
        if (order && order.status === types_1.OrderStatus.CREATED) {
            await this.updateOrderStatus(orderId, types_1.OrderStatus.ACCEPTED);
            // Manual operation - no automatic progression
        }
    }
    async startPreparation(orderId) {
        const order = this.activeOrders.get(orderId);
        if (order && order.status === types_1.OrderStatus.ACCEPTED) {
            await this.updateOrderStatus(orderId, types_1.OrderStatus.PREPARING);
            // Manual operation - no automatic progression
        }
    }
    async completePreparation(orderId) {
        const order = this.activeOrders.get(orderId);
        if (order && order.status === types_1.OrderStatus.PREPARING) {
            await this.updateOrderStatus(orderId, types_1.OrderStatus.READY);
            // Manual operation - no automatic progression
        }
    }
    async updateOrderStatus(orderId, newStatus) {
        const order = this.activeOrders.get(orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date();
            const statusEvent = {
                orderId: orderId,
                status: newStatus,
                timestamp: new Date(),
                serviceId: 'restaurant-service',
                metadata: {
                    restaurantId: order.restaurantId,
                    restaurantName: order.restaurant?.name
                }
            };
            // Publish status update to Kafka
            await this.kafkaService.publishMessage('order-status', statusEvent);
            console.log(`Order ${orderId} status updated to ${newStatus}`);
        }
    }
    // Manual status update (for restaurant dashboard)
    async manualUpdateOrderStatus(orderId, newStatus) {
        const order = this.activeOrders.get(orderId);
        if (order) {
            await this.updateOrderStatus(orderId, newStatus);
            return true;
        }
        return false;
    }
    getActiveOrders() {
        return Array.from(this.activeOrders.values())
            .filter(order => order.status !== types_1.OrderStatus.DELIVERED);
    }
    getOrdersByRestaurant(restaurantId) {
        return Array.from(this.activeOrders.values())
            .filter(order => order.restaurantId === restaurantId);
    }
    getOrder(orderId) {
        return this.activeOrders.get(orderId);
    }
    getRestaurants() {
        return Array.from(this.restaurants.values());
    }
    getRestaurant(restaurantId) {
        return this.restaurants.get(restaurantId);
    }
    async handleOrderStatusUpdate(statusEvent) {
        const order = this.activeOrders.get(statusEvent.orderId);
        if (order) {
            // Update local order status to keep it in sync with the order service
            order.status = statusEvent.status;
            order.updatedAt = new Date();
            this.activeOrders.set(order.id, order);
            console.log(`Restaurant service updated order ${order.id} status to ${statusEvent.status} (from ${statusEvent.serviceId})`);
        }
    }
    // Get statistics
    getOrderStats() {
        const orders = Array.from(this.activeOrders.values());
        const byStatus = {};
        const byRestaurant = {};
        orders.forEach(order => {
            byStatus[order.status] = (byStatus[order.status] || 0) + 1;
            byRestaurant[order.restaurant?.name || 'Unknown'] = (byRestaurant[order.restaurant?.name || 'Unknown'] || 0) + 1;
        });
        return {
            total: orders.length,
            byStatus,
            byRestaurant,
        };
    }
}
exports.RestaurantService = RestaurantService;
//# sourceMappingURL=restaurantService.js.map