"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Clock, RotateCw, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type Order = {
  id: string
  items: { id: string; name: string; price: number; quantity: number }[]
  total: number
  status: "waiting" | "processing" | "completed"
  timestamp: number
  location: string | null
  locationDetail: string | null
}

type OrderHistoryProps = {
  language: string
  onNewOrder: () => void
  customerName: string
}

export default function OrderHistory({ language, onNewOrder, customerName }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const translations = {
    it: {
      title: "I tuoi ordini",
      noOrders: "Non hai ancora effettuato ordini",
      newOrder: "Nuovo ordine",
      waiting: "In attesa",
      processing: "In lavorazione",
      completed: "Completato",
      orderNumber: "Ordine #",
      items: "prodotti",
      euro: "Euro",
      from: "da",
      loading: "Caricamento ordini...",
      error: "Errore nel caricamento degli ordini",
      refreshing: "Aggiornamento in corso...",
      refresh: "Aggiorna"
    },
    en: {
      title: "Your orders",
      noOrders: "You haven't placed any orders yet",
      newOrder: "New order",
      waiting: "Waiting",
      processing: "Processing",
      completed: "Completed",
      orderNumber: "Order #",
      items: "items",
      euro: "Euro",
      from: "from",
      loading: "Loading orders...",
      error: "Error loading orders",
      refreshing: "Refreshing...",
      refresh: "Refresh"
    },
  }

  const t = translations[language as keyof typeof translations]

  // Funzione per caricare gli ordini dal database
  const fetchOrders = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // In futuro qui possiamo aggiungere un parametro per filtrare gli ordini per cliente
      const response = await fetch(`/api/orders?customerName=${encodeURIComponent(customerName)}`);
      
      if (!response.ok) {
        throw new Error('Errore nel recupero degli ordini');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Converte i dati degli ordini dal formato API al formato componente
        const formattedOrders: Order[] = data.data.map((order: any) => ({
          id: order._id,
          items: order.items.map((item: any) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: order.total,
          status: order.status,
          timestamp: new Date(order.createdAt).getTime(),
          location: order.location,
          locationDetail: order.locationDetail
        }));
        
        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Errore nel caricamento degli ordini:', err);
      setError('Errore nel caricamento degli ordini');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Carica gli ordini dal database al montaggio del componente
  useEffect(() => {
    setIsLoading(true);
    fetchOrders();
  }, [customerName]);

  // Funzione per aggiornare manualmente gli ordini
  const handleRefresh = () => {
    fetchOrders();
  };

  // Get status icon based on order status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "processing":
        return <RotateCw className="h-5 w-5 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  // Get status text based on order status
  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return t.waiting
      case "processing":
        return t.processing
      case "completed":
        return t.completed
      default:
        return ""
    }
  }

  // Get status color based on order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-amber-100 text-amber-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString(language === "it" ? "it-IT" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get location name based on language
  const getLocationName = (location: string | null): string => {
    if (!location) return ""

    const locationNames: Record<string, string> = {
      camera: language === "it" ? "Camera" : "Room",
      piscina: language === "it" ? "Piscina" : "Pool",
      giardino: language === "it" ? "Giardino" : "Garden",
    }

    return locationNames[location] || location
  }

  // Visualizza un indicatore di caricamento durante il recupero degli ordini
  if (isLoading) {
    return (
      <div className="w-full max-w-md text-center py-8">
        <p className="text-gray-600">{t.loading}</p>
      </div>
    );
  }

  // Visualizza un messaggio di errore se il caricamento fallisce
  if (error) {
    return (
      <div className="w-full max-w-md text-center py-8">
        <p className="text-red-500">{t.error}</p>
        <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-medium" onClick={onNewOrder}>
          {t.newOrder}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-playful text-black">{t.title}</h1>
        <Button 
          size="icon" 
          variant="outline" 
          className="rounded-full h-10 w-10 bg-amber-100 border-amber-300 hover:bg-amber-200"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw className="h-5 w-5 text-amber-800 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5 text-amber-800" />
          )}
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-6">{t.noOrders}</p>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white font-medium" onClick={onNewOrder}>
            {t.newOrder}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-black">
                    {t.orderNumber}
                    {order.id.slice(-4)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.timestamp)} • {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    {t.items}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{getStatusText(order.status)}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {t.euro} {order.total.toFixed(2)} • {t.from} {getLocationName(order.location)}
                {order.locationDetail && ` - ${order.locationDetail}`}
              </p>
            </motion.div>
          ))}

          <div className="mt-6 text-center">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-medium" onClick={onNewOrder}>
              {t.newOrder}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

