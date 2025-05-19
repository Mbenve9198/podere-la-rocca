"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

type Order = {
  id: string
  customerName: string
  location: string
  locationDetail: string | null
  timestamp: number
  status: "waiting" | "processing" | "completed" | "cancelled"
  items: { id: string; name: string; price: number; quantity: number }[]
  total: number
  pickup_time?: string | null
}

type AdminListViewProps = {
  orders: Order[]
  onViewDetails: (order: Order) => void
  onUpdateStatus: (orderId: string, newStatus: "waiting" | "processing" | "completed" | "cancelled") => void
  updatingOrderIds: string[]
}

export default function AdminListView({ orders, onViewDetails, onUpdateStatus, updatingOrderIds }: AdminListViewProps) {
  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get time elapsed since order was placed
  const getTimeElapsed = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Adesso"
    if (minutes === 1) return "1 minuto fa"
    return `${minutes} minuti fa`
  }

  // Get location name
  const getLocationName = (location: string): string => {
    const locationNames: Record<string, string> = {
      camera: "Camera",
      piscina: "Piscina",
      giardino: "Giardino",
    }

    return locationNames[location] || location
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <span className="text-amber-500">⏳</span>
      case "processing":
        return <span className="text-blue-500">🔄</span>
      case "completed":
        return <span className="text-green-500">✅</span>
      default:
        return null
    }
  }

  // Verifica se un ordine contiene prodotti Light Lunch
  const hasLightLunchItems = (order: Order) => {
    return order.items.some(item => 
      item.id.startsWith("lightLunch_") || 
      item.id.includes("lightLunch") || 
      item.name.toLowerCase().includes("light lunch")
    )
  }

  // Update the getActionButton function to include a cancel button
  // Get action button based on status
  const getActionButton = (order: Order) => {
    // Controlla se l'ordine è in fase di aggiornamento
    const isUpdating = updatingOrderIds.includes(order.id);
    
    switch (order.status) {
      case "waiting":
        return (
          <div className="flex space-x-2">
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => onUpdateStatus(order.id, "processing")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"></span>
                  Aggiornamento...
                </>
              ) : (
                "Avvia preparazione"
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <span className="animate-spin h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent"></span>
              ) : (
                <span className="text-lg">❌</span>
              )}
            </Button>
          </div>
        )
      case "processing":
        return (
          <div className="flex space-x-2">
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onUpdateStatus(order.id, "completed")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"></span>
                  Aggiornamento...
                </>
              ) : (
                "Completa ordine"
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <span className="animate-spin h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent"></span>
              ) : (
                <span className="text-lg">❌</span>
              )}
            </Button>
          </div>
        )
      case "completed":
        return (
          <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700" disabled>
            Ordine completato
          </Button>
        )
      case "cancelled":
        return (
          <Button className="w-full bg-red-100 text-red-700" disabled>
            Ordine annullato
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-black">{order.customerName}</h3>
                <p className="text-sm text-gray-500">
                  {getTimeElapsed(order.timestamp)} • {formatTime(order.timestamp)}
                </p>
              </div>
              <div className="flex items-center">{getStatusIcon(order.status)}</div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {getLocationName(order.location)}
                  {order.locationDetail && ` - ${order.locationDetail}`}
                </p>
                <p className="text-sm text-gray-600">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} prodotti • Euro {order.total.toFixed(2)}
                </p>
                {hasLightLunchItems(order) && order.pickup_time && (
                  <p className="text-sm text-amber-600 mt-1 flex items-center">
                    <span className="mr-1">⏰</span>
                    Ritiro Light Lunch: {order.pickup_time}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-amber-500"
                onClick={() => onViewDetails(order)}
              >
                <span className="text-lg">➡️</span>
              </Button>
            </div>

            {getActionButton(order)}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

