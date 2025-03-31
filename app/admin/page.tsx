"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, ClipboardList, MenuSquare, BarChart3 } from "lucide-react"
import AdminListView from "./list-view"
import AdminCardView from "./card-view"
import AdminOrderDetail from "./order-detail"
import { useRouter } from "next/navigation"

// Definisco il tipo Order corrispondente al modello del database
type OrderItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type Order = {
  id: string
  orderNumber?: string
  customerName: string
  location: string
  locationDetail: string | null
  timestamp: number
  status: "waiting" | "processing" | "completed" | "cancelled"
  items: OrderItem[]
  total: number
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "processing" | "completed" | "cancelled">(
    "waiting",
  )
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Funzione per recuperare gli ordini dal backend
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Costruisci l'URL con i filtri necessari
      let url = "/api/admin/orders"
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data)) {
        // Converti i dati dal formato API al formato del componente
        const formattedOrders: Order[] = data.data.map((order: any) => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          location: order.location,
          locationDetail: order.locationDetail,
          timestamp: new Date(order.createdAt).getTime(),
          status: order.status,
          items: order.items.map((item: any) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: order.total
        }))
        
        setOrders(formattedOrders)
      } else {
        setOrders([])
        if (!data.success) {
          setError(data.message || "Errore nel recupero degli ordini")
        }
      }
    } catch (err: any) {
      console.error("Errore durante il recupero degli ordini:", err)
      setError(err.message || "Si è verificato un errore durante il recupero degli ordini")
    } finally {
      setIsLoading(false)
    }
  }

  // Carica gli ordini quando il componente viene montato o quando cambia il filtro
  useEffect(() => {
    fetchOrders()
    
    // Imposta un intervallo per aggiornare gli ordini periodicamente (ogni 30 secondi)
    const interval = setInterval(() => {
      fetchOrders()
    }, 30000)
    
    // Rimuovi l'intervallo quando il componente viene smontato
    return () => clearInterval(interval)
  }, [statusFilter])

  // Aggiorna lo stato di un ordine
  const updateOrderStatus = async (orderId: string, newStatus: "waiting" | "processing" | "completed" | "cancelled") => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error(`Errore nell'aggiornamento dello stato: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Aggiorna lo stato localmente per evitare di ricaricare tutti gli ordini
        setOrders(prevOrders =>
          prevOrders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
        )
        
        // Se stiamo aggiornando l'ordine selezionato, aggiorniamo anche quello
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        console.error("Errore nell'aggiornamento dello stato:", data.message)
        setError(data.message || "Errore nell'aggiornamento dello stato dell'ordine")
      }
    } catch (err: any) {
      console.error("Errore durante l'aggiornamento dello stato dell'ordine:", err)
      setError(err.message || "Si è verificato un errore durante l'aggiornamento dello stato")
    }
  }

  // Visualizza i dettagli dell'ordine
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  // Chiudi i dettagli dell'ordine
  const closeOrderDetails = () => {
    setSelectedOrder(null)
  }

  // Se è in corso il caricamento, mostra un indicatore
  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-amber-50 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium mb-2">Caricamento ordini...</h2>
          <p className="text-gray-500">Attendere prego</p>
        </div>
      </div>
    )
  }

  // Se c'è un errore, mostralo
  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-amber-50 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium mb-2">Errore</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button 
            className="bg-amber-500 hover:bg-amber-600"
            onClick={() => fetchOrders()}
          >
            Riprova
          </Button>
        </div>
      </div>
    )
  }

  // Se un ordine è selezionato, mostra i suoi dettagli
  if (selectedOrder) {
    return (
      <>
        <AdminOrderDetail order={selectedOrder} onClose={closeOrderDetails} onUpdateStatus={updateOrderStatus} />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="grid grid-cols-3 h-16">
            <button className="flex flex-col items-center justify-center bg-amber-50 text-amber-600 border-t-2 border-amber-500">
              <ClipboardList className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">Ordini</span>
            </button>
            <button 
              className="flex flex-col items-center justify-center text-gray-600"
              onClick={() => router.push("/admin/menu")}
            >
              <MenuSquare className="h-6 w-6" />
              <span className="text-xs mt-1">Modifica menu</span>
            </button>
            <button 
              className="flex flex-col items-center justify-center text-gray-600"
              onClick={() => router.push("/admin/analytics")}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs mt-1">Analytics</span>
            </button>
          </div>
        </div>
      </>
    )
  }

  // Filtra gli ordini in base allo stato selezionato
  const filteredOrders = statusFilter === "all" ? orders : orders.filter(order => order.status === statusFilter)

  return (
    <div className="flex flex-col min-h-screen bg-amber-50 pb-16">
      {/* Large tabs for view switching */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            className={`h-14 text-lg ${viewMode === "list" ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
            onClick={() => setViewMode("list")}
          >
            <span className="text-xl mr-2">📋</span>
            Lista
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            className={`h-14 text-lg ${viewMode === "card" ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
            onClick={() => setViewMode("card")}
          >
            <span className="text-xl mr-2">🃏</span>
            Card
          </Button>
        </div>
      </div>

      {/* Status filter select */}
      <div className="p-4 bg-white border-b border-gray-200">
        <select
          className="w-full p-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">Tutti gli ordini</option>
          <option value="waiting">In attesa</option>
          <option value="processing">In lavorazione</option>
          <option value="completed">Completati</option>
          <option value="cancelled">Annullati</option>
        </select>
      </div>

      {/* Pulsante di aggiornamento manuale */}
      <div className="px-4 pt-2">
        <Button
          variant="outline"
          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={() => fetchOrders()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-amber-700 rounded-full"></span>
              Aggiornamento...
            </>
          ) : (
            <>
              <span className="mr-2">🔄</span>
              Aggiorna ordini
            </>
          )}
        </Button>
      </div>

      <main className="flex-1 p-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <CheckCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
                  <h2 className="text-xl font-medium mb-2">Nessun ordine</h2>
                  <p>Non ci sono ordini con questo stato</p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : viewMode === "list" ? (
          <AdminListView orders={filteredOrders} onViewDetails={viewOrderDetails} onUpdateStatus={updateOrderStatus} />
        ) : (
          <AdminCardView orders={filteredOrders} onViewDetails={viewOrderDetails} onUpdateStatus={updateOrderStatus} />
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-3 h-16">
          <button className="flex flex-col items-center justify-center bg-amber-50 text-amber-600 border-t-2 border-amber-500">
            <span className="text-xl">📋</span>
            <span className="text-xs mt-1 font-medium">Ordini</span>
          </button>
          <button
            className="flex flex-col items-center justify-center text-gray-600"
            onClick={() => router.push("/admin/menu")}
          >
            <span className="text-xl">🍽️</span>
            <span className="text-xs mt-1">Modifica menu</span>
          </button>
          <button
            className="flex flex-col items-center justify-center text-gray-600"
            onClick={() => router.push("/admin/analytics")}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  )
}

