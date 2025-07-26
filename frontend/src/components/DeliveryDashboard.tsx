'use client';

import { useState, useEffect } from 'react';
import { deliveryApi } from '@/lib/api';
import { Delivery, DeliveryDriver, DeliveryStats } from '@/types';
import { MapPin, Clock, User, Car, Bike, Package, CheckCircle, Zap } from 'lucide-react';

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [stats, setStats] = useState<DeliveryStats | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000); // Update every 1 second for demo speed
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [deliveriesData, driversData, statsData] = await Promise.all([
        deliveryApi.getDeliveries(),
        deliveryApi.getDrivers(),
        deliveryApi.getDeliveryStats(),
      ]);
      
      setDeliveries(deliveriesData);
      setDrivers(driversData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading delivery data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'text-yellow-600 bg-yellow-50';
      case 'EN_ROUTE_TO_RESTAURANT': return 'text-blue-600 bg-blue-50';
      case 'AT_RESTAURANT': return 'text-orange-600 bg-orange-50';
      case 'PICKED_UP': return 'text-purple-600 bg-purple-50';
      case 'EN_ROUTE_TO_CUSTOMER': return 'text-indigo-600 bg-indigo-50';
      case 'DELIVERED': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bike': return <Bike className="w-4 h-4" />;
      case 'motorcycle': return <Zap className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const activeDeliveries = deliveries.filter(delivery => delivery.status !== 'DELIVERED');
  const completedDeliveries = deliveries.filter(delivery => delivery.status === 'DELIVERED');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">🚚 Delivery Management Dashboard</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-blue-800">Active Deliveries</h3>
          <p className="text-2xl font-bold text-blue-600">{activeDeliveries.length}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-green-800">Completed Today</h3>
          <p className="text-2xl font-bold text-green-600">{completedDeliveries.length}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-purple-800">Available Drivers</h3>
          <p className="text-2xl font-bold text-purple-600">{stats?.availableDrivers || 0}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border">
          <h3 className="font-semibold text-orange-800">Total Drivers</h3>
          <p className="text-2xl font-bold text-orange-600">{drivers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Deliveries */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Deliveries ({activeDeliveries.length})</h2>
          <div className="space-y-4">
            {activeDeliveries.length === 0 ? (
              <p className="text-gray-500">No active deliveries</p>
            ) : (
              activeDeliveries.map(delivery => {
                const driver = drivers.find(d => d.id === delivery.driverId);
                return (
                  <div key={delivery.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Delivery #{delivery.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">Order: {delivery.orderId.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          Assigned: {new Date(delivery.assignedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace(/_/g, ' ')}
                      </div>
                    </div>

                    {driver && (
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{driver.name}</span>
                          {getVehicleIcon(driver.vehicleType)}
                          <span className="text-sm text-gray-600 capitalize">{driver.vehicleType}</span>
                        </div>
                        <p className="text-sm text-gray-600">Phone: {driver.phone}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          Location: {delivery.currentLocation.latitude.toFixed(4)}, {delivery.currentLocation.longitude.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">
                          ETA: {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()}
                        </span>
                      </div>

                      {delivery.pickedUpAt && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            Picked up: {new Date(delivery.pickedUpAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(delivery.progressPercentage || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${delivery.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drivers Status */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Drivers Status</h2>
          <div className="space-y-3">
            {drivers.map(driver => (
              <div key={driver.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{driver.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    driver.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {driver.isAvailable ? 'Available' : 'Busy'}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    {getVehicleIcon(driver.vehicleType)}
                    <span className="capitalize">{driver.vehicleType}</span>
                  </div>
                  <p>Phone: {driver.phone}</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {driver.currentLocation.latitude.toFixed(4)}, {driver.currentLocation.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Completed Deliveries */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Completed</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {completedDeliveries.slice(0, 5).map(delivery => (
                <div key={delivery.id} className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{delivery.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-600">
                        Order: {delivery.orderId.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Delivered</span>
                    </div>
                  </div>
                  {delivery.deliveredAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(delivery.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

