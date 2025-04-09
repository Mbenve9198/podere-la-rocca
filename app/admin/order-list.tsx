import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import React from 'react';

const translations = {
  it: {
    orders: 'Ordini',
    orderNumber: "Ordine #",
    customer: "Cliente",
    location: "Posizione",
    total: "Totale",
    status: "Stato",
    pickupTime: "Ritiro alle",
    waiting: "In attesa",
    processing: "In lavorazione",
    completed: "Completato",
    cancelled: "Annullato",
    refresh: "Aggiorna",
    loading: "Caricamento...",
    error: "Errore nel caricamento degli ordini",
  },
  en: {
    orders: 'Orders',
    orderNumber: "Order #",
    customer: "Customer",
    location: "Location",
    total: "Total",
    status: "Status",
    pickupTime: "Pickup at",
    waiting: "Waiting",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
    refresh: "Refresh",
    loading: "Loading...",
    error: "Error loading orders",
  },
};

interface Order {
  id: string;
  customerName: string;
  location: string;
  locationDetail?: string;
  pickupTime?: string;
  timestamp: string;
  status: string;
  total: number;
}

export default function OrderList(): React.ReactElement {
  const router = useRouter();
  const { locale } = router;
  const t = translations[locale as keyof typeof translations];
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', {
      locale: locale === 'it' ? it : enUS,
    });
  };

  const getLocationName = (location: string) => {
    // Implementa la logica per ottenere il nome della posizione
    return location;
  };

  if (loading) return <div>{t.loading}</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t.orders}</h1>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t.refresh}
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-black">
                  {t.orderNumber}
                  {order.id.slice(-4)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(order.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {order.customerName}
              </p>
              <p className="text-sm text-gray-600">
                {getLocationName(order.location)}
                {order.locationDetail && ` - ${order.locationDetail}`}
                {order.pickupTime && ` • ${t.pickupTime} ${order.pickupTime}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 