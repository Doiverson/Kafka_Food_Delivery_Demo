'use client';

import { useState } from 'react';
import CustomerDashboard from '@/components/CustomerDashboard';
import RestaurantDashboard from '@/components/RestaurantDashboard';
import DeliveryDashboard from '@/components/DeliveryDashboard';
import { User, Store, Truck } from 'lucide-react';

export default function HomePage() {
  const [activeView, setActiveView] = useState<'customer' | 'restaurant' | 'delivery'>('customer');

  const views = [
    { id: 'customer', label: 'Customer View', icon: User, component: CustomerDashboard },
    { id: 'restaurant', label: 'Restaurant View', icon: Store, component: RestaurantDashboard },
    { id: 'delivery', label: 'Delivery View', icon: Truck, component: DeliveryDashboard },
  ] as const;

  const ActiveComponent = views.find((view) => view.id === activeView)?.component || CustomerDashboard;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">🚀 Kafka Food Delivery Demo</h1>
              <span className="text-sm text-gray-600 font-medium">Real-time Event-Driven Architecture</span>
            </div>

            <div className="flex space-x-1">
              {views.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeView === view.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{view.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-semibold text-white mb-3">🔄 Kafka Topics</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>
                  <code className="bg-gray-700 text-gray-100 px-3 py-1 rounded font-mono">orders</code> - New order
                  events
                </li>
                <li>
                  <code className="bg-gray-700 text-gray-100 px-3 py-1 rounded font-mono">order-status</code> - Status
                  updates
                </li>
                <li>
                  <code className="bg-gray-700 text-gray-100 px-3 py-1 rounded font-mono">delivery-location</code> -
                  Location tracking
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">🏗️ Services</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="font-medium">Order Service (Port 3001)</li>
                <li className="font-medium">Restaurant Service (Port 3002)</li>
                <li className="font-medium">Delivery Service (Port 3003)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">📊 Monitoring</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>
                  <a
                    href="http://localhost:8080"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
                  >
                    Kafka UI (Port 8080)
                  </a>
                </li>
                <li className="font-medium">Real-time message flow</li>
                <li className="font-medium">Topic & partition monitoring</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 font-medium">
              Kafka Food Delivery Demo - Demonstrating Event-Driven Microservices Architecture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
