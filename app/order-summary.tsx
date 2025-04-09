"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type OrderSummaryProps = {
  cart: { id: string; name: string; price: number; quantity: number }[]
  updateCart: (newCart: { id: string; name: string; price: number; quantity: number }[]) => void
  customerName: string
  updateCustomerName: (name: string) => void
  location: string | null
  locationDetail: string | null
  updateLocation: (location: string | null, detail: string | null) => void
  onBack: () => void
  language: string
  onPlaceOrder: () => void
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
    // Call the parent's onPlaceOrder function
    onPlaceOrder()
  }

  return (
    <div className="w-full max-w-md pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-playful text-black">{t.title}</h1>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-gray-700">{t.customer}</h2>
          {!isEditingName && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => setIsEditingName(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              {t.edit}
            </Button>
          )}
        </div>

        {isEditingName ? (
          <div className="space-y-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border-amber-300 focus:border-amber-500"
            />
            <div className="flex space-x-2">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleSaveName}>
                {t.save}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-300"
                onClick={() => {
                  setNewName(customerName)
                  setIsEditingName(false)
                }}
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-black">{customerName}</p>
        )}
      </div>

      {/* Location info */}
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

      {/* Order items */}
      <div className="border-t border-gray-200 my-6 pt-4">
        <h2 className="font-medium text-lg text-black mb-4">{t.yourOrder}</h2>
      </div>
      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">{t.empty}</div>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-black">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {t.euro} {item.price.toFixed(2)}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-red-500" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-end">
                <button
                  className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                  onClick={() => decrementQuantity(item.id)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="mx-3 font-medium">{item.quantity}</span>
                <button
                  className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                  onClick={() => incrementQuantity(item.id)}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place order button */}
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

      {/* Order confirmation dialog */}
      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center font-playful text-black">{t.orderPlaced}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-gray-700">{t.orderConfirmation}</p>
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  setShowConfirmation(false)
                  // In a real app, this would reset the cart and navigate back to the menu
                  updateCart([])
                }}
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

