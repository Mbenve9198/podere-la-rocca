"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, Edit2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrderSummaryProps = {
  cart: { id: string; name: string; price: number; quantity: number; category?: string }[]
  updateCart: (newCart: { id: string; name: string; price: number; quantity: number; category?: string }[]) => void
  customerName: string
  updateCustomerName: (name: string) => void
  location: string | null
  locationDetail: string | null
  updateLocation: (location: string | null, detail: string | null) => void
  onBack: () => void
  language: string
  onPlaceOrder: (pickupTime?: string) => void
}

export default function OrderSummary({
  cart,
  updateCart,
  customerName,
  updateCustomerName,
  location,
  locationDetail,
  updateLocation,
  onBack,
  language,
  onPlaceOrder,
}: OrderSummaryProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(customerName)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [pickupTime, setPickupTime] = useState<string>("")
  const [showPickupTimeDialog, setShowPickupTimeDialog] = useState(false)

  const hasLightLunch = cart.some(item => item.category === 'light-lunch')

  const translations = {
    it: {
      title: "Riepilogo Ordine",
      back: "Indietro",
      yourOrder: "Il tuo ordine",
      empty: "Il tuo carrello è vuoto",
      customer: "Cliente",
      location: "Posizione",
      edit: "Modifica",
      save: "Salva",
      cancel: "Annulla",
      total: "Totale",
      placeOrder: "Ordina",
      euro: "Euro",
      camera: "Camera",
      piscina: "Piscina",
      giardino: "Giardino",
      orderPlaced: "Ordine inviato!",
      orderConfirmation: "Il tuo ordine è stato inviato con successo. Ti verrà servito al più presto.",
      close: "Chiudi",
      pickupTime: "Orario di ritiro",
      pickupTimeRequired: "Seleziona l'orario di ritiro",
      pickupTimeInfo: "Il Light Lunch deve essere ritirato entro le 12:30",
    },
    en: {
      title: "Order Summary",
      back: "Back",
      yourOrder: "Your order",
      empty: "Your cart is empty",
      customer: "Customer",
      location: "Location",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      total: "Total",
      placeOrder: "Place Order",
      euro: "Euro",
      camera: "Room",
      piscina: "Pool",
      giardino: "Garden",
      orderPlaced: "Order Placed!",
      orderConfirmation: "Your order has been successfully placed. It will be served to you shortly.",
      close: "Close",
      pickupTime: "Pickup time",
      pickupTimeRequired: "Select pickup time",
      pickupTimeInfo: "Light Lunch must be picked up by 12:30 PM",
    },
  }

  const t = translations[language as keyof typeof translations]
  const [showConfirmation, setShowConfirmation] = useState(false)

  const incrementQuantity = (itemId: string) => {
    const newCart = cart.map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item))
    updateCart(newCart)
  }

  const decrementQuantity = (itemId: string) => {
    const newCart = cart.map((item) =>
      item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
    )
    updateCart(newCart)
  }

  const removeItem = (itemId: string) => {
    const newCart = cart.filter((item) => item.id !== itemId)
    updateCart(newCart)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSaveName = () => {
    updateCustomerName(newName)
    setIsEditingName(false)
  }

  const getLocationName = (loc: string | null): string => {
    if (!loc) return ""

    const locationNames: Record<string, string> = {
      camera: t.camera,
      piscina: t.piscina,
      giardino: t.giardino,
    }

    return locationNames[loc] || loc
  }

  const handlePlaceOrder = () => {
    if (hasLightLunch && !pickupTime) {
      setShowPickupTimeDialog(true)
      return
    }
    onPlaceOrder(pickupTime)
  }

  // Genera gli orari di ritiro disponibili (ogni 15 minuti dalle 12:00 alle 12:30)
  const pickupTimes = Array.from({ length: 3 }, (_, i) => {
    const minutes = i * 15
    const time = new Date()
    time.setHours(12, minutes, 0)
    return time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-gray-700">{t.customer}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={() => setIsEditingName(true)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            {t.edit}
          </Button>
        </div>
        <p className="text-black">{customerName}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-gray-700">{t.location}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={() => setIsEditingLocation(true)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            {t.edit}
          </Button>
        </div>
        <p className="text-black">
          {getLocationName(location)}
          {locationDetail && ` - ${locationDetail}`}
        </p>
      </div>

      {hasLightLunch && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h2 className="font-medium text-gray-700">{t.pickupTime}</h2>
          </div>
          <Select value={pickupTime} onValueChange={setPickupTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.pickupTimeRequired} />
            </SelectTrigger>
            <SelectContent>
              {pickupTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-2">{t.pickupTimeInfo}</p>
        </div>
      )}

      {/* Order items */}
      <div className="border-t border-gray-200 my-6 pt-4">
        <h2 className="font-medium text-lg text-black mb-4">{t.yourOrder}</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">€{item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => decrementQuantity(item.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => incrementQuantity(item.id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">{t.total}</span>
          <span className="font-medium text-gray-900">€{getTotalPrice().toFixed(2)}</span>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-full shadow-lg flex items-center justify-center space-x-2 w-full max-w-md"
            onClick={handlePlaceOrder}
          >
            <span>
              {t.placeOrder} • {t.euro} {getTotalPrice().toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Location edit dialog */}
      {isEditingLocation && (
        <Dialog open={isEditingLocation} onOpenChange={setIsEditingLocation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-playful text-black">{t.location}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-gray-500 mb-4">
                Per modificare la posizione, torna alla schermata iniziale.
              </p>
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setIsEditingLocation(false)}
              >
                {t.close}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Pickup time required dialog */}
      {showPickupTimeDialog && (
        <Dialog open={showPickupTimeDialog} onOpenChange={setShowPickupTimeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-playful text-black">
                {t.pickupTimeRequired}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-gray-500 mb-4">
                {t.pickupTimeInfo}
              </p>
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setShowPickupTimeDialog(false)}
              >
                {t.close}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

