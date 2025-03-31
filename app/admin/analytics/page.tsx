"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "react-hot-toast"

type TimeFilter = "today" | "week" | "month" | "year"
type ChartView = "revenue" | "orders" | "products" | "locations"

interface SummaryData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
}

interface TopItem {
  id: string;
  name: string;
  count: number;
  trend: number;
}

export default function AnalyticsDashboard() {
  const router = useRouter()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week")
  const [activeChart, setActiveChart] = useState<ChartView>("revenue")
  const [loading, setLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [topProducts, setTopProducts] = useState<TopItem[]>([])
  const [topLocations, setTopLocations] = useState<TopItem[]>([])

  // Carica i dati iniziali
  useEffect(() => {
    fetchSummaryData(timeFilter)
    fetchTopProducts(timeFilter)
    fetchTopLocations(timeFilter)
  }, [])

  // Aggiorna i dati quando cambia il filtro temporale
  useEffect(() => {
    fetchSummaryData(timeFilter)
    fetchTopProducts(timeFilter)
    fetchTopLocations(timeFilter)
  }, [timeFilter])

  // Recupera i dati di riepilogo
  const fetchSummaryData = async (period: TimeFilter) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/summary?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        setSummaryData(result.data)
      } else {
        console.error("Errore nel recupero dei dati di riepilogo:", result)
        toast.error("Errore nel caricamento dei dati di riepilogo")
      }
    } catch (error) {
      console.error("Errore nella richiesta dei dati di riepilogo:", error)
      toast.error("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  // Recupera i prodotti più venduti
  const fetchTopProducts = async (period: TimeFilter) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/top-products?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        setTopProducts(result.data)
      } else {
        console.error("Errore nel recupero dei prodotti più venduti:", result)
        toast.error("Errore nel caricamento dei prodotti più venduti")
      }
    } catch (error) {
      console.error("Errore nella richiesta dei prodotti più venduti:", error)
      toast.error("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  // Recupera le location più attive
  const fetchTopLocations = async (period: TimeFilter) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/top-locations?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        setTopLocations(result.data)
      } else {
        console.error("Errore nel recupero delle location più attive:", result)
        toast.error("Errore nel caricamento delle location più attive")
      }
    } catch (error) {
      console.error("Errore nella richiesta delle location più attive:", error)
      toast.error("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value)
  }

  // Get time period label
  const getTimePeriodLabel = (): string => {
    switch (timeFilter) {
      case "today":
        return "Oggi"
      case "week":
        return "Questa settimana"
      case "month":
        return "Questo mese"
      case "year":
        return "Quest'anno"
    }
  }

  // Render trend indicator
  const renderTrendIndicator = (value: number) => {
    const color = value >= 0 ? "text-green-500" : "text-red-500"
    const icon = value >= 0 ? "↑" : "↓"
    return (
      <span className={`${color} font-medium text-sm`}>
        {icon} {Math.abs(value)}%
      </span>
    )
  }

  // Render spinner per caricamento
  const renderSpinner = () => (
    <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  // Render chart based on active view
  const renderChart = () => {
    if (loading) {
      return renderSpinner()
    }
    
    switch (activeChart) {
      case "revenue":
        return renderRevenueChart()
      case "orders":
        return renderOrdersChart()
      case "products":
        return renderProductsChart()
      case "locations":
        return renderLocationsChart()
    }
  }

  // Render revenue chart
  const renderRevenueChart = () => {
    if (!summaryData) {
      return <div className="text-center py-8 text-gray-500">Nessun dato disponibile</div>
    }
    
    const revenueData = {
      today: timeFilter === "today" ? summaryData.revenue.current : 0,
      week: timeFilter === "week" ? summaryData.revenue.current : 0,
      month: timeFilter === "month" ? summaryData.revenue.current : 0,
      year: timeFilter === "year" ? summaryData.revenue.current : 0,
    }
    
    const maxValue = Math.max(
      revenueData.today,
      revenueData.week,
      revenueData.month,
      revenueData.year / 12,
    ) || 1 // Evita divisione per zero

    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Fatturato {getTimePeriodLabel()}</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">Totale</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData.revenue.current)}</p>
            </div>
            <div className="bg-amber-50 px-3 py-1 rounded-full">
              {renderTrendIndicator(summaryData.revenue.change)}
            </div>
          </div>

          <div className="h-40 flex items-end space-x-2">
            {["today", "week", "month", "year"].map((period) => (
              <div key={period} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t-md ${period === timeFilter ? "bg-amber-500" : "bg-amber-200"}`}
                  style={{
                    height: `${(revenueData[period as TimeFilter] / (period === "year" ? maxValue * 12 : maxValue)) * 100}%`,
                    maxHeight: "100%",
                    minHeight: "4px" // Garantisce che le barre siano sempre visibili
                  }}
                ></div>
                <p className="text-xs mt-1 text-gray-500 capitalize">
                  {period === "today" ? "Oggi" : period === "week" ? "Sett." : period === "month" ? "Mese" : "Anno"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render orders chart
  const renderOrdersChart = () => {
    if (!summaryData) {
      return <div className="text-center py-8 text-gray-500">Nessun dato disponibile</div>
    }
    
    const ordersData = {
      today: timeFilter === "today" ? summaryData.orders.current : 0,
      week: timeFilter === "week" ? summaryData.orders.current : 0,
      month: timeFilter === "month" ? summaryData.orders.current : 0,
      year: timeFilter === "year" ? summaryData.orders.current : 0,
    }
    
    const maxValue = Math.max(
      ordersData.today,
      ordersData.week / 7,
      ordersData.month / 30,
      ordersData.year / 365,
    ) || 1 // Evita divisione per zero

    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Ordini {getTimePeriodLabel()}</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">Totale</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.orders.current}</p>
            </div>
            <div className="bg-amber-50 px-3 py-1 rounded-full">
              {renderTrendIndicator(summaryData.orders.change)}
            </div>
          </div>

          <div className="h-40 flex items-end space-x-2">
            {["today", "week", "month", "year"].map((period) => {
              let normalizedValue: number
              switch (period) {
                case "today":
                  normalizedValue = ordersData.today
                  break
                case "week":
                  normalizedValue = ordersData.week / 7
                  break
                case "month":
                  normalizedValue = ordersData.month / 30
                  break
                case "year":
                  normalizedValue = ordersData.year / 365
                  break
                default:
                  normalizedValue = 0
              }

              return (
                <div key={period} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t-md ${period === timeFilter ? "bg-amber-500" : "bg-amber-200"}`}
                    style={{
                      height: `${(normalizedValue / maxValue) * 100}%`,
                      maxHeight: "100%",
                      minHeight: "4px" // Garantisce che le barre siano sempre visibili
                    }}
                  ></div>
                  <p className="text-xs mt-1 text-gray-500 capitalize">
                    {period === "today" ? "Oggi" : period === "week" ? "Sett." : period === "month" ? "Mese" : "Anno"}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Render products chart
  const renderProductsChart = () => {
    if (topProducts.length === 0) {
      return <div className="text-center py-8 text-gray-500">Nessun prodotto trovato</div>
    }
    
    const maxCount = topProducts[0].count || 1 // Evita divisione per zero

    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Prodotti più venduti</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-4">
            {topProducts.map((product, index) => {
              const percentage = (product.count / maxCount) * 100

              return (
                <div key={product.id} className="flex items-center">
                  <div className="w-6 text-gray-500 font-medium">{index + 1}</div>
                  <div className="flex-1 ml-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{product.name}</span>
                      <span className="text-sm text-gray-500">{product.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                  <div className="ml-3">{renderTrendIndicator(product.trend)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Render locations chart
  const renderLocationsChart = () => {
    if (topLocations.length === 0) {
      return <div className="text-center py-8 text-gray-500">Nessuna zona trovata</div>
    }
    
    const maxCount = topLocations[0].count || 1 // Evita divisione per zero

    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Zone più attive</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-4">
            {topLocations.map((location, index) => {
              const percentage = (location.count / maxCount) * 100

              return (
                <div key={location.id} className="flex items-center">
                  <div className="w-6 text-gray-500 font-medium">{index + 1}</div>
                  <div className="flex-1 ml-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{location.name}</span>
                      <span className="text-sm text-gray-500">{location.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                  <div className="ml-3">{renderTrendIndicator(location.trend)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50 pb-16">
      {/* Time period filter */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          {(["today", "week", "month", "year"] as TimeFilter[]).map((period) => (
            <Button
              key={period}
              variant={timeFilter === period ? "default" : "outline"}
              className={`${timeFilter === period ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
              onClick={() => setTimeFilter(period)}
            >
              {period === "today" ? "Oggi" : period === "week" ? "Settimana" : period === "month" ? "Mese" : "Anno"}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-xs text-gray-500">Fatturato</p>
                {loading || !summaryData ? (
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded mt-1 mb-2"></div>
                ) : (
                  <>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(summaryData.revenue.current)}</p>
                    <div className="mt-1">{renderTrendIndicator(summaryData.revenue.change)}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-xs text-gray-500">Ordini</p>
                {loading || !summaryData ? (
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded mt-1 mb-2"></div>
                ) : (
                  <>
                    <p className="text-lg font-bold text-gray-900">{summaryData.orders.current}</p>
                    <div className="mt-1">{renderTrendIndicator(summaryData.orders.change)}</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart navigation */}
        <div className="mt-6 mb-4 grid grid-cols-4 gap-1">
          {(["revenue", "orders", "products", "locations"] as ChartView[]).map((view) => (
            <Button
              key={view}
              variant={activeChart === view ? "default" : "outline"}
              className={`${activeChart === view ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
              onClick={() => setActiveChart(view)}
              size="sm"
            >
              {view === "revenue"
                ? "Fatturato"
                : view === "orders"
                  ? "Ordini"
                  : view === "products"
                    ? "Prodotti"
                    : "Zone"}
            </Button>
          ))}
        </div>

        {/* Active chart */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderChart()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-3 h-16">
          <button
            className="flex flex-col items-center justify-center text-gray-600"
            onClick={() => router.push("/admin")}
          >
            <span className="text-xl">📋</span>
            <span className="text-xs mt-1">Ordini</span>
          </button>
          <button
            className="flex flex-col items-center justify-center text-gray-600"
            onClick={() => router.push("/admin/menu")}
          >
            <span className="text-xl">🍽️</span>
            <span className="text-xs mt-1">Modifica menu</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-amber-50 text-amber-600 border-t-2 border-amber-500">
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1 font-medium">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  )
}

