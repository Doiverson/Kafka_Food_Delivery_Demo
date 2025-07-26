import { OrderStatus, Restaurant, OrderWithRestaurant } from './types';
import { KafkaService } from './kafka';
export declare class RestaurantService {
    private kafkaService;
    private activeOrders;
    private restaurants;
    constructor(kafkaService: KafkaService);
    private initializeRestaurants;
    initialize(): Promise<void>;
    private handleNewOrder;
    acceptOrder(orderId: string): Promise<void>;
    startPreparation(orderId: string): Promise<void>;
    completePreparation(orderId: string): Promise<void>;
    private updateOrderStatus;
    manualUpdateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<boolean>;
    getActiveOrders(): OrderWithRestaurant[];
    getOrdersByRestaurant(restaurantId: string): OrderWithRestaurant[];
    getOrder(orderId: string): OrderWithRestaurant | undefined;
    getRestaurants(): Restaurant[];
    getRestaurant(restaurantId: string): Restaurant | undefined;
    private handleOrderStatusUpdate;
    getOrderStats(): {
        total: number;
        byStatus: Record<string, number>;
        byRestaurant: Record<string, number>;
    };
}
//# sourceMappingURL=restaurantService.d.ts.map