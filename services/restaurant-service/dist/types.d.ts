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
export declare enum OrderStatus {
    CREATED = "CREATED",
    ACCEPTED = "ACCEPTED",
    PREPARING = "PREPARING",
    READY = "READY",
    PICKED_UP = "PICKED_UP",
    DELIVERED = "DELIVERED"
}
export interface OrderStatusEvent {
    orderId: string;
    status: OrderStatus;
    timestamp: Date;
    serviceId: string;
    metadata?: any;
}
export interface Restaurant {
    id: string;
    name: string;
    address: string;
    phone: string;
    preparationTime: number;
}
export interface OrderWithRestaurant extends Order {
    restaurant?: Restaurant;
}
//# sourceMappingURL=types.d.ts.map