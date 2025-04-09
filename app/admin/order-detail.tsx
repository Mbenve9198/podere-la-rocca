"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

type Order = {
  id: string
  customerName: string
  location: string
  locationDetail: string | null
  timestamp: number
  status: "waiting" | "processing" | "completed" | "cancelled"
  items: { id: string; name: string; price: number; quantity: number }[]
  total: number
  pickupTime?: string
}

type AdminOrderDetailProps = {
  order: Order
  onClose: () => void
  onUpdateStatus: (orderId: string, newStatus: "waiting" | "processing" | "completed" | "cancelled") => void
  updatingOrderIds: string[]
}

export default function AdminOrderDetail({ order, onClose, onUpdateStatus, updatingOrderIds }: AdminOrderDetailProps) {
  const { t } = useTranslation()

  // Format timestamp to readable date and time
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString("it-IT", {
      day: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    let bgColor, textColor, icon

    switch (status) {
      case "waiting":
        bgColor = "bg-amber-100"
        textColor = "text-amber-800"
        icon = <span className="text-lg mr-1">⏳</span>
        break
      case "processing":
        bgColor = "bg-blue-100"
        textColor = "text-blue-800"
        icon = <span className="text-lg mr-1">🔄</span>
        break
      case "completed":
        bgColor = "bg-green-100"
        textColor = "text-green-800"
        icon = <span className="text-lg mr-1">✅</span>
        break
      case "cancelled":
        bgColor = "bg-red-100"
        textColor = "text-red-800"
        icon = <span className="text-lg mr-1">❌</span>
        break
      default:
        bgColor = "bg-gray-100"
        textColor = "text-gray-800"
        icon = null
    }

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
        {icon}
        <span>
          {status === "waiting"
            ? "In attesa"
            : status === "processing"
              ? "In lavorazione"
              : status === "completed"
                ? "Completato"
                : "Annullato"}
        </span>
      </div>
    )
  }

  // Get action buttons based on status
  const getActionButtons = () => {
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
              className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-red-500 border-t-transparent"></span>
                  Aggiornamento...
                </>
              ) : (
                <>
                  <span className="text-lg mr-2">⚠️</span>
                  Annulla
                </>
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
              className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-red-500 border-t-transparent"></span>
                  Aggiornamento...
                </>
              ) : (
                <>
                  <span className="text-lg mr-2">⚠️</span>
                  Annulla
                </>
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
    <div className="flex flex-col min-h-screen bg-amber-50 pb-16">
      <header className="bg-amber-500 text-white p-4 shadow-md">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white hover:bg-amber-600 mr-2" onClick={onClose}>
            <span className="text-lg">⬅️</span>
          </Button>
          <h1 className="text-xl font-playful">{t.orderDetails}</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-medium">Ordine #{order.id.slice(-4)}</h2>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-500">{formatDateTime(order.timestamp)}</p>
          </div>

          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2">{t.customer}</h3>
            <p className="text-black">{order.customerName}</p>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">{t.location}</h3>
              <p className="text-black">
                {getLocationName(order.location)}
                {order.locationDetail && ` - ${order.locationDetail}`}
              </p>
            </div>

            {order.pickupTime && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">{t.pickupTime}</h3>
                <p className="text-black">{order.pickupTime}</p>
              </div>
            )}
          </div>

          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2">{t.items}</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                  </div>
                  <div className="text-gray-700">€{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">{t.total}</h3>
              <div className="font-bold text-lg">€{order.total.toFixed(2)}</div>
            </div>
          </div>

          <div className="p-4">{getActionButtons()}</div>
        </motion.div>
      </main>
    </div>
  )
}

