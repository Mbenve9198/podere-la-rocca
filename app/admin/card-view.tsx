"use client"

import { useState } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

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

type AdminCardViewProps = {
  orders: Order[]
  onViewDetails: (order: Order) => void
  onUpdateStatus: (orderId: string, newStatus: "waiting" | "processing" | "completed" | "cancelled") => void
  updatingOrderIds: string[]
}

export default function AdminCardView({ orders, onViewDetails, onUpdateStatus, updatingOrderIds }: AdminCardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)

  // If there are no orders, show a message
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <CheckCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-medium mb-2">Nessun ordine</h2>
            <p>Non ci sono ordini con questo stato</p>
          </div>
        </div>
      </div>
    )
  }

  const currentOrder = orders[currentIndex]

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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-amber-100 text-amber-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return ""
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "In attesa"
      case "processing":
        return "In lavorazione"
      case "completed":
        return "Completato"
      case "cancelled":
        return "Annullato"
      default:
        return ""
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <span className="text-xl">⏳</span>
      case "processing":
        return <span className="text-xl">🔄</span>
      case "completed":
        return <span className="text-xl">✅</span>
      case "cancelled":
        return <span className="text-xl">❌</span>
      default:
        return null
    }
  }

  // Verifica se l'ordine contiene prodotti Light Lunch
  const hasLightLunchItems = (order: Order) => {
    return order.items.some(item => 
      item.id.startsWith("lightLunch_") || 
      item.id.includes("lightLunch") || 
      item.name.toLowerCase().includes("light lunch")
    )
  }

  // Handle swipe
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100

    if (info.offset.x > threshold) {
      // Swiped right - process or complete the order
      handleNextAction()
      setExitDirection("right")
      setTimeout(() => {
        setExitDirection(null)
        goToNextCard()
      }, 300)
    } else if (info.offset.x < -threshold) {
      // Swiped left - skip this order
      setExitDirection("left")
      setTimeout(() => {
        setExitDirection(null)
        goToNextCard()
      }, 300)
    }
  }

  // Go to next card
  const goToNextCard = () => {
    if (currentIndex < orders.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Loop back to the first card if we're at the end
      setCurrentIndex(0)
    }
  }

  // Handle next action based on status
  const handleNextAction = () => {
    if (currentOrder.status === "waiting") {
      onUpdateStatus(currentOrder.id, "processing")
    } else if (currentOrder.status === "processing") {
      onUpdateStatus(currentOrder.id, "completed")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-full max-w-md h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOrder.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: exitDirection === "left" ? -300 : exitDirection === "right" ? 300 : 0,
              rotate: exitDirection === "left" ? -10 : exitDirection === "right" ? 10 : 0,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 bg-white rounded-xl shadow-xl overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header with status */}
              <div className="p-4 border-b border-gray-100">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentOrder.status)}`}
                >
                  {getStatusIcon(currentOrder.status)}
                  <span className="ml-1">{getStatusText(currentOrder.status)}</span>
                </div>
              </div>

              {/* Order content */}
              <div className="flex-1 p-4 overflow-auto">
                <h2 className="text-xl font-medium mb-1">{currentOrder.customerName}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {getTimeElapsed(currentOrder.timestamp)} • {formatTime(currentOrder.timestamp)}
                </p>

                <div className="bg-amber-50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">
                    {getLocationName(currentOrder.location)}
                    {currentOrder.locationDetail && ` - ${currentOrder.locationDetail}`}
                  </p>
                </div>

                {/* Orario di ritiro Light Lunch */}
                {hasLightLunchItems(currentOrder) && currentOrder.pickup_time && (
                  <div className="bg-amber-100 p-3 rounded-lg mb-4 flex items-start">
                    <span className="text-amber-600 text-lg mr-2">⏰</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Orario ritiro Light Lunch</p>
                      <p className="text-sm text-amber-700">{currentOrder.pickup_time}</p>
                    </div>
                  </div>
                )}

                <h3 className="font-medium text-gray-700 mb-2">Prodotti:</h3>
                <div className="space-y-2 mb-4">
                  {currentOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex">
                        <span className="text-gray-800 font-medium">{item.quantity}x</span>
                        <span className="ml-2">{item.name}</span>
                      </div>
                      <span className="text-gray-600">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Totale</span>
                    <span className="font-bold text-lg">€{currentOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 border-t border-gray-100">
                {currentOrder.status === "waiting" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => onUpdateStatus(currentOrder.id, "processing")}
                      disabled={updatingOrderIds.includes(currentOrder.id)}
                    >
                      {updatingOrderIds.includes(currentOrder.id) ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"></span>
                          Aggiornamento...
                        </>
                      ) : (
                        <>
                          <span className="text-lg mr-2">🔄</span>
                          Avvia
                        </>
                      )}
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => onUpdateStatus(currentOrder.id, "cancelled")}
                      disabled={updatingOrderIds.includes(currentOrder.id)}
                    >
                      {updatingOrderIds.includes(currentOrder.id) ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"></span>
                          Aggiornamento...
                        </>
                      ) : (
                        <>
                          <span className="text-lg mr-2">❌</span>
                          Annulla
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {currentOrder.status === "processing" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => onUpdateStatus(currentOrder.id, "completed")}
                      disabled={updatingOrderIds.includes(currentOrder.id)}
                    >
                      {updatingOrderIds.includes(currentOrder.id) ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"></span>
                          Aggiornamento...
                        </>
                      ) : (
                        <>
                          <span className="text-lg mr-2">✅</span>
                          Completa
                        </>
                      )}
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => onUpdateStatus(currentOrder.id, "cancelled")}
                      disabled={updatingOrderIds.includes(currentOrder.id)}
                    >
                      {updatingOrderIds.includes(currentOrder.id) ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent"></span>
                          Aggiornamento...
                        </>
                      ) : (
                        <>
                          <span className="text-lg mr-2">❌</span>
                          Annulla
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {currentOrder.status === "completed" && (
                  <Button className="w-full bg-gray-200 text-gray-700" disabled>
                    Ordine completato
                  </Button>
                )}

                {currentOrder.status === "cancelled" && (
                  <Button className="w-full bg-red-100 text-red-700" disabled>
                    Ordine annullato
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Card counter */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Ordine {currentIndex + 1} di {orders.length}
      </div>

      <div className="mt-2 text-center text-xs text-gray-400">Scorri a destra per avanzare, a sinistra per saltare</div>
    </div>
  )
}

