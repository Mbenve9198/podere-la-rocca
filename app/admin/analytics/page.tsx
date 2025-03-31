"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for analytics
const mockData = {
  revenue: {
    today: 245.5,
    week: 1876.0,
    month: 7450.0,
    year: 89400.0,
    previousPeriod: {
      today: 210.0,
      week: 1650.0,
      month: 6900.0,
      year: 78500.0,
    },
  },
  orders: {
    today: 18,
    week: 124,
    month: 496,
    year: 5950,
    previousPeriod: {
      today: 15,
      week: 118,
      month: 472,
      year: 5600,
    },
  },
  topProducts: [
    { id: "aperol", name: "Aperol Spritz", count: 342, trend: 12 },
    { id: "hugo", name: "Hugo", count: 287, trend: 8 },
    { id: "insalatona-tonno", name: "Insalatona con tonno", count: 245, trend: -3 },
    { id: "caffe", name: "Caffè", count: 198, trend: 5 },
    { id: "coca-cola", name: "Coca Cola", count: 176, trend: -2 },
  ],
  topLocations: [
    { id: "piscina", name: "Piscina", count: 456, trend: 15 },
    { id: "camera", name: "Camera", count: 324, trend: 7 },
    { id: "giardino", name: "Giardino", count: 198, trend: -5 },
  ],
}

type TimeFilter = "today" | "week" | "month" | "year"
type ChartView = "revenue" | "orders" | "products" | "locations"

export default function AnalyticsDashboard() {
  const router = useRouter()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week")
  const [activeChart, setActiveChart] = useState<ChartView>("revenue")

  // Calculate percentage change
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 100
    return Math.round(((current - previous) / previous) * 100)
  }

  // Get revenue change percentage
  const getRevenueChange = (): number => {
    const current = mockData.revenue[timeFilter]
    const previous = mockData.revenue.previousPeriod[timeFilter]
    return calculateChange(current, previous)
  }

  // Get orders change percentage
  const getOrdersChange = (): number => {
    const current = mockData.orders[timeFilter]
    const previous = mockData.orders.previousPeriod[timeFilter]
    return calculateChange(current, previous)
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

  // Render chart based on active view
  const renderChart = () => {
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
    const maxValue = Math.max(
      mockData.revenue.today,
      mockData.revenue.week,
      mockData.revenue.month,
      mockData.revenue.year / 12,
    )

    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Fatturato {getTimePeriodLabel()}</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">Totale</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.revenue[timeFilter])}</p>
            </div>
            <div className="bg-amber-50 px-3 py-1 rounded-full">{renderTrendIndicator(getRevenueChange())}</div>
          </div>

          <div className="h-40 flex items-end space-x-2">
            {["today", "week", "month", "year"].map((period) => (
              <div key={period} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t-md ${period === timeFilter ? "bg-amber-500" : "bg-amber-200"}`}
                  style={{
                    height: `${(mockData.revenue[period as TimeFilter] / (period === "year" ? maxValue * 12 : maxValue)) * 100}%`,
                    maxHeight: "100%",
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
    const maxValue = Math.max(
      mockData.orders.today,
      mockData.orders.week / 7,
      mockData.orders.month / 30,
      mockData.orders.year / 365,
    )

    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Ordini {getTimePeriodLabel()}</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">Totale</p>
              <p className="text-2xl font-bold text-gray-900">{mockData.orders[timeFilter]}</p>
            </div>
            <div className="bg-amber-50 px-3 py-1 rounded-full">{renderTrendIndicator(getOrdersChange())}</div>
          </div>

          <div className="h-40 flex items-end space-x-2">
            {["today", "week", "month", "year"].map((period) => {
              let normalizedValue
              switch (period) {
                case "today":
                  normalizedValue = mockData.orders.today
                  break
                case "week":
                  normalizedValue = mockData.orders.week / 7
                  break
                case "month":
                  normalizedValue = mockData.orders.month / 30
                  break
                case "year":
                  normalizedValue = mockData.orders.year / 365
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
    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Prodotti più venduti</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-4">
            {mockData.topProducts.map((product, index) => {
              const maxCount = mockData.topProducts[0].count
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
    return (
      <div className="mt-4">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Zone più attive</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-4">
            {mockData.topLocations.map((location, index) => {
              const maxCount = mockData.topLocations[0].count
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
                <p className="text-lg font-bold text-gray-900">{formatCurrency(mockData.revenue[timeFilter])}</p>
                <div className="mt-1">{renderTrendIndicator(getRevenueChange())}</div>
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
                <p className="text-lg font-bold text-gray-900">{mockData.orders[timeFilter]}</p>
                <div className="mt-1">{renderTrendIndicator(getOrdersChange())}</div>
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

