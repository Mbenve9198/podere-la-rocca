"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, ClipboardList, MenuSquare, BarChart3 } from "lucide-react"
import AdminListView from "./list-view"
import AdminCardView from "./card-view"
import AdminOrderDetail from "./order-detail"
import { useRouter } from "next/navigation"

// Mock data for orders
const mockOrders = [
  {
    id: "ord-001",
    customerName: "Marco Rossi",
    location: "camera",
    locationDetail: "Junior suite 10",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    status: "waiting",
    items: [
      { id: "aperol", name: "Aperol Spritz", price: 7, quantity: 2 },
      { id: "acqua", name: "Acqua naturale 500ml", price: 1.5, quantity: 1 },
    ],
    total: 15.5,
  },
  {
    id: "ord-002",
    customerName: "Giulia Bianchi",
    location: "piscina",
    locationDetail: "Ombrellone 3",
    timestamp: Date.now() - 1000 * 60 * 8, // 8 minutes ago
    status: "processing",
    items: [
      { id: "insalatona-tonno", name: "Insalatona con tonno, pomodorini, lattuga e olive", price: 12, quantity: 1 },
      { id: "coca-cola", name: "Coca Cola", price: 3, quantity: 2 },
    ],
    total: 18,
  },
  {
    id: "ord-003",
    customerName: "Alessandro Verdi",
    location: "giardino",
    locationDetail: null,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    status: "completed",
    items: [
      { id: "cappuccino", name: "Cappuccino", price: 3, quantity: 1 },
      { id: "caffe", name: "Caffè", price: 2, quantity: 1 },
    ],
    total: 5,
  },
  {
    id: "ord-004",
    customerName: "Francesca Neri",
    location: "piscina",
    locationDetail: "Ombrellone 7",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    status: "waiting",
    items: [
      { id: "hugo", name: "Hugo", price: 7, quantity: 3 },
      { id: "patatine", name: "Patatine fritte", price: 4, quantity: 1 },
    ],
    total: 25,
  },
  {
    id: "ord-005",
    customerName: "Roberto Marini",
    location: "camera",
    locationDetail: "Poggio Saragio 11",
    timestamp: Date.now() - 1000 * 60 * 12, // 12 minutes ago
    status: "waiting",
    items: [
      { id: "tagliata", name: "Tagliata di vitellone bianco al rosmarino", price: 18, quantity: 1 },
      { id: "insalata-mista", name: "Insalata mista (pomodorini e lattuga)", price: 4, quantity: 1 },
      { id: "birra", name: "Birra 33cl", price: 6, quantity: 1 },
    ],
    total: 28,
  },
]

type Order = {
  id: string
  customerName: string
  location: string
  locationDetail: string | null
  timestamp: number
  status: "waiting" | "processing" | "completed" | "cancelled"
  items: { id: string; name: string; price: number; quantity: number }[]
  total: number
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "processing" | "completed" | "cancelled">(
    "waiting",
  )
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  // Filter orders based on status
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    return order.status === statusFilter
  })

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: "waiting" | "processing" | "completed" | "cancelled") => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    )

    // If we're updating the currently selected order, update that too
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  // Close order details
  const closeOrderDetails = () => {
    setSelectedOrder(null)
  }

  // If an order is selected, show its details
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
            <button className="flex flex-col items-center justify-center text-gray-600">
              <MenuSquare className="h-6 w-6" />
              <span className="text-xs mt-1">Modifica menu</span>
            </button>
            <button className="flex flex-col items-center justify-center text-gray-600">
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs mt-1">Analytics</span>
            </button>
          </div>
        </div>
      </>
    )
  }

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

