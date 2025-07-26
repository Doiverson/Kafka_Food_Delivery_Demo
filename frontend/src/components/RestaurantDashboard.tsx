'use client';

import { useState, useEffect } from 'react';
import { restaurantApi } from '@/lib/api';
import { Order, Restaurant } from '@/types';
import { Clock, CheckCircle, AlertCircle, Package, Play, Check } from 'lucide-react';

export default function RestaurantDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; byRestaurant: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      loadOrders();
      const interval = setInterval(loadOrders, 3000); // Update every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedRestaurant]);

  const loadRestaurants = async () => {
    try {
      const data = await restaurantApi.getRestaurants();
      setRestaurants(data);
      if (data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(data[0]);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const loadOrders = async () => {
    if (!selectedRestaurant) return;
    
    try {
      const [ordersData, statsData, deliveriesData] = await Promise.all([
        restaurantApi.getRestaurantOrders(selectedRestaurant.id),
        restaurantApi.getRestaurantStats(),
        fetch('http://localhost:3003/api/deliveries').then(res => res.json()).catch(() => [])
      ]);
      
      // Update order status based on delivery information
      const updatedOrders = ordersData
        .filter(order => order.restaurantId === selectedRestaurant.id)
        .map(order => {
          const delivery = deliveriesData.find((d: any) => d.orderId === order.id);
          if (delivery && delivery.status === 'DELIVERED') {
            return { ...order, status: 'DELIVERED' };
          }
          return order;
        });
      
      setOrders(updatedOrders);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleAction = async (orderId: string, action: string) => {
    setLoading(prev => ({ ...prev, [orderId]: true }));
    
    try {
      switch (action) {
        case 'accept':
          await restaurantApi.acceptOrder(orderId);
          break;
        case 'prepare':
          await restaurantApi.startPreparation(orderId);
          break;
        case 'ready':
          await restaurantApi.markReady(orderId);
          break;
      }
      
      await loadOrders();
    } catch (error) {
      console.error(`Error with action ${action}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'text-yellow-600 bg-yellow-50';
      case 'ACCEPTED': return 'text-blue-600 bg-blue-50';
      case 'PREPARING': return 'text-orange-600 bg-orange-50';
      case 'READY': return 'text-purple-600 bg-purple-50';
      case 'PICKED_UP': return 'text-indigo-600 bg-indigo-50';
      case 'DELIVERED': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED': return <AlertCircle className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'PREPARING': return <Clock className="w-4 h-4" />;
      case 'READY': return <Package className="w-4 h-4" />;
      case 'PICKED_UP': return <CheckCircle className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAvailableActions = (status: string) => {
    switch (status) {
      case 'CREATED':
        return [{ action: 'accept', label: 'Accept Order', icon: Check, color: 'bg-green-500 hover:bg-green-600' }];
      case 'ACCEPTED':
        return [{ action: 'prepare', label: 'Start Preparing', icon: Play, color: 'bg-blue-500 hover:bg-blue-600' }];
      case 'PREPARING':
        return [{ action: 'ready', label: 'Mark Ready', icon: Package, color: 'bg-purple-500 hover:bg-purple-600' }];
      default:
        return [];
    }
  };

  const activeOrders = orders.filter(order => !['DELIVERED'].includes(order.status));
  const completedOrders = orders.filter(order => ['DELIVERED'].includes(order.status));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">🏪 Restaurant Management Dashboard</h1>

      {/* Restaurant Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">Select Restaurant:</label>
        <select
          value={selectedRestaurant?.id || ''}
          onChange={(e) => {
            const restaurant = restaurants.find(r => r.id === e.target.value);
            setSelectedRestaurant(restaurant || null);
          }}
          className="border rounded px-3 py-2"
        >
          {restaurants.map(restaurant => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRestaurant && (
        <>
          {/* Restaurant Info & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-lg text-gray-800">{selectedRestaurant.name}</h3>
              <p className="text-sm text-gray-600">{selectedRestaurant.address}</p>
              <p className="text-sm text-gray-500">Prep Time: {selectedRestaurant.preparationTime} min</p>
            </div>
            
            {stats && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-blue-800">Total Orders</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-orange-800">Preparing</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.byStatus.PREPARING || 0}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-green-800">Completed</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.byStatus.DELIVERED || 0}</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Orders */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Orders ({activeOrders.length})</h2>
              <div className="space-y-4">
                {activeOrders.length === 0 ? (
                  <p className="text-gray-500">No active orders</p>
                ) : (
                  activeOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium">{order.status}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm"><strong>Customer:</strong> {order.customerId}</p>
                        <p className="text-sm"><strong>Items:</strong></p>
                        <ul className="text-sm ml-4 space-y-1">
                          {order.items.map(item => (
                            <li key={item.itemId} className="flex justify-between">
                              <span>{item.name} x{item.quantity}</span>
                              <span>¥{item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm font-semibold mt-2">
                          <strong>Total: ¥{order.totalPrice}</strong>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {getAvailableActions(order.status).map(({ action, label, icon: Icon, color }) => (
                          <button
                            key={action}
                            onClick={() => handleAction(order.id, action)}
                            disabled={loading[order.id]}
                            className={`px-4 py-2 text-white rounded flex items-center gap-2 ${color} disabled:opacity-50`}
                          >
                            <Icon className="w-4 h-4" />
                            {loading[order.id] ? 'Processing...' : label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Orders */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Completed Orders ({completedOrders.length})</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {completedOrders.length === 0 ? (
                  <p className="text-gray-500">No completed orders</p>
                ) : (
                  completedOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium">{order.status}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p><strong>Items:</strong> {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p>
                        <p><strong>Total:</strong> ¥{order.totalPrice}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}