'use client';

import { useState, useEffect } from 'react';
import { orderApi, restaurantApi, deliveryApi } from '@/lib/api';
import { Order, Restaurant, OrderItem, CreateOrderRequest, Delivery } from '@/types';
import { Package, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function CustomerDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerId] = useState('customer-1'); // Mock customer ID
  const [deliveries, setDeliveries] = useState<Record<string, Delivery>>({});
  const [loading, setLoading] = useState(false);

  // Mock menu items
  const menuItems: Record<string, OrderItem[]> = {
    'rest-1': [
      { itemId: 'ramen-1', name: 'Tonkotsu Ramen', quantity: 1, price: 1200 },
      { itemId: 'ramen-2', name: 'Miso Ramen', quantity: 1, price: 1100 },
      { itemId: 'gyoza-1', name: 'Pork Gyoza (6pcs)', quantity: 1, price: 600 },
    ],
    'rest-2': [
      { itemId: 'sushi-1', name: 'Sushi Set A', quantity: 1, price: 2500 },
      { itemId: 'sushi-2', name: 'Salmon Roll', quantity: 1, price: 800 },
      { itemId: 'sashimi-1', name: 'Mixed Sashimi', quantity: 1, price: 1800 },
    ],
    'rest-3': [
      { itemId: 'burger-1', name: 'Classic Burger', quantity: 1, price: 1000 },
      { itemId: 'burger-2', name: 'Cheese Burger', quantity: 1, price: 1200 },
      { itemId: 'fries-1', name: 'French Fries', quantity: 1, price: 400 },
    ],
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000); // Update every 1 second for demo speed
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [restaurantsData, ordersData] = await Promise.all([
        restaurantApi.getRestaurants(),
        orderApi.getOrders(customerId),
      ]);
      
      setRestaurants(restaurantsData);
      setOrders(ordersData);

      // Load delivery info for orders that have delivery
      const deliveryPromises = ordersData
        .filter(order => ['PICKED_UP', 'DELIVERED'].includes(order.status))
        .map(async (order) => {
          try {
            const delivery = await deliveryApi.getDeliveryByOrder(order.id);
            return { orderId: order.id, delivery };
          } catch {
            return null;
          }
        });

      const deliveryResults = await Promise.all(deliveryPromises);
      const newDeliveries: Record<string, Delivery> = {};
      deliveryResults.forEach(result => {
        if (result) {
          newDeliveries[result.orderId] = result.delivery;
        }
      });
      setDeliveries(newDeliveries);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addToCart = (item: OrderItem) => {
    const existingItem = cart.find(cartItem => cartItem.itemId === item.itemId);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.itemId === item.itemId 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.itemId === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const placeOrder = async () => {
    if (!selectedRestaurant || cart.length === 0) return;

    setLoading(true);
    try {
      const orderRequest: CreateOrderRequest = {
        customerId,
        items: cart,
        restaurantId: selectedRestaurant.id,
      };

      await orderApi.createOrder(orderRequest);
      setCart([]);
      setSelectedRestaurant(null);
      await loadData();
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'text-yellow-600';
      case 'ACCEPTED': return 'text-blue-600';
      case 'PREPARING': return 'text-orange-600';
      case 'READY': return 'text-purple-600';
      case 'PICKED_UP': return 'text-indigo-600';
      case 'DELIVERED': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED': return <AlertCircle className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'PREPARING': return <Clock className="w-4 h-4" />;
      case 'READY': return <Package className="w-4 h-4" />;
      case 'PICKED_UP': return <MapPin className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">🍜 Food Delivery - Customer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Restaurant Selection & Menu */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Restaurant</h2>
            <div className="grid gap-4">
              {restaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors shadow-sm bg-white ${
                    selectedRestaurant?.id === restaurant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-800">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.address}</p>
                  <p className="text-sm text-gray-500">Prep time: {restaurant.preparationTime} min</p>
                </div>
              ))}
            </div>
          </div>

          {/* Menu */}
          {selectedRestaurant && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Menu - {selectedRestaurant.name}</h2>
              <div className="space-y-3">
                {menuItems[selectedRestaurant.id]?.map(item => (
                  <div key={item.itemId} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">¥{item.price}</p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart */}
          {cart.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Cart</h2>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.itemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm text-gray-600 ml-2">¥{item.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="ml-2 text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <div className="flex justify-between font-semibold">
                  <span>Total: ¥{totalPrice}</span>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Placing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order History & Status */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Orders</h2>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders yet. Place your first order!</p>
            ) : (
              orders.map(order => {
                const delivery = deliveries[order.id];
                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-medium">{order.status}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><strong>Restaurant:</strong> {restaurants.find(r => r.id === order.restaurantId)?.name}</p>
                      <p><strong>Items:</strong> {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p>
                      <p><strong>Total:</strong> ¥{order.totalPrice}</p>
                    </div>

                    {delivery && (
                      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-green-800">Delivery Tracking</p>
                          <span className="text-xs text-green-600">{Math.round(delivery.progressPercentage || 0)}%</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-green-100 rounded-full h-1.5 mb-2">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${delivery.progressPercentage || 0}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-sm text-green-600">Status: {delivery.status.replace(/_/g, ' ')}</p>
                        {delivery.currentLocation && (
                          <p className="text-sm text-green-600">
                            Location: {delivery.currentLocation.latitude.toFixed(4)}, {delivery.currentLocation.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}