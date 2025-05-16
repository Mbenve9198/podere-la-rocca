"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import PickupTimeSelector from "@/components/pickup-time-selector"
import { toast } from "react-hot-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  pickupTime: string | undefined
  updatePickupTime: (time: string) => void
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
  pickupTime,
  updatePickupTime,
}: OrderSummaryProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(customerName)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [lightLunchSettings, setLightLunchSettings] = useState({
    order_deadline: "12:00",
    available_days: ["monday", "tuesday", "thursday", "friday", "saturday", "sunday"]
  })

  const hasLightLunchItems = cart.some(item => item.id.startsWith("lightLunch"))
  const hasRegularItems = cart.some(item => !item.id.startsWith("lightLunch"))

  useEffect(() => {
    // Carica le impostazioni del Light Lunch
    const fetchSettings = async () => {
      try {
        // Assumiamo che ci sia un endpoint per ottenere la categoria "lightLunch"
        const response = await fetch('/api/categories?name=lightLunch')
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          const settings = data.data[0]
          setLightLunchSettings({
            order_deadline: settings.order_deadline || "12:00",
            available_days: settings.available_days || ["monday", "tuesday", "thursday", "friday", "saturday", "sunday"]
          })
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni:", error)
      }
    }

    if (hasLightLunchItems) {
      fetchSettings()
    }
  }, [hasLightLunchItems])

  const validateOrderTime = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentDay = now.getDay()
    const currentTime = currentHour + (currentMinutes / 60)

    let errors = []

    // Validazione Light Lunch
    if (hasLightLunchItems) {
      if (currentDay === 3) {
        errors.push(language === 'it'
          ? 'Il Light Lunch non è disponibile il mercoledì'
          : 'Light Lunch is not available on Wednesday')
      }
      
      // Estrai ore e minuti dall'orario limite
      const [deadlineHours, deadlineMinutes] = lightLunchSettings.order_deadline.split(':').map(Number)
      
      // Verifica l'orario confrontando con l'orario limite
      if (currentHour > deadlineHours || (currentHour === deadlineHours && currentMinutes >= deadlineMinutes)) {
        errors.push(language === 'it'
          ? `Le ordinazioni del Light Lunch devono essere effettuate entro le ${lightLunchSettings.order_deadline}`
          : `Light Lunch orders must be placed before ${lightLunchSettings.order_deadline}`)
      }
    }

    // Validazione altri prodotti
    if (hasRegularItems) {
      if (currentDay === 3 && currentHour >= 13) {
        errors.push(language === 'it'
          ? 'Il servizio è sospeso il mercoledì pomeriggio'
          : 'Service is suspended on Wednesday afternoon')
      }
      const isValidTime = (currentTime >= 11 && currentTime < 12.5) || (currentTime >= 16 && currentTime < 19)
      if (!isValidTime) {
        errors.push(language === 'it'
          ? 'Il servizio è disponibile dalle 11:00 alle 12:30 e dalle 16:00 alle 19:00'
          : 'Service is available from 11:00 to 12:30 and from 16:00 to 19:00')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handlePlaceOrder = () => {
    const validation = validateOrderTime()
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    if (hasLightLunchItems && !pickupTime) {
      toast.error(
        language === 'it'
          ? 'Seleziona un orario di ritiro per il Light Lunch'
          : 'Please select a pickup time for Light Lunch'
      )
      return
    }

    onPlaceOrder()
  }

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
      euro: "€",
      camera: "Camera",
      piscina: "Piscina",
      giardino: "Giardino",
      orderPlaced: "Ordine inviato!",
      orderConfirmation: "Il tuo ordine è stato inviato con successo. Ti verrà servito al più presto.",
      close: "Chiudi",
      orderSummary: "Riepilogo Ordine",
      editName: "Modifica Nome",
      editLocation: "Modifica Posizione",
      lightLunchNote: "Nota: I prodotti del Light Lunch devono essere ritirati al ristorante",
      regularDeliveryNote: "Gli altri prodotti verranno consegnati alla posizione selezionata",
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
      euro: "€",
      camera: "Room",
      piscina: "Pool",
      giardino: "Garden",
      orderPlaced: "Order Placed!",
      orderConfirmation: "Your order has been successfully placed. It will be served to you shortly.",
      close: "Close",
      orderSummary: "Order Summary",
      editName: "Edit Name",
      editLocation: "Edit Location",
      lightLunchNote: "Note: Light Lunch items must be picked up at the restaurant",
      regularDeliveryNote: "Other items will be delivered to the selected location",
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

      {/* Order Type Information */}
      {hasLightLunchItems && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-2">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">
                {language === 'it' ? 'Informazioni Light Lunch' : 'Light Lunch Information'}
              </p>
              <ul className="text-sm text-amber-700 list-disc list-inside space-y-1 mt-1">
                <li>{t.lightLunchNote}</li>
                {hasRegularItems && <li>{t.regularDeliveryNote}</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Light Lunch Pickup Time */}
      {hasLightLunchItems && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
          <h3 className="text-amber-800 font-medium mb-2">
            {language === 'it' ? 'Orario di ritiro' : 'Pickup Time'}
          </h3>
          <p className="text-amber-700 text-sm mb-4">
            {language === 'it' 
              ? 'Il Light Lunch è disponibile dal lunedì alla domenica (escluso mercoledì). Le ordinazioni devono essere effettuate entro le 12:00 e ritirate entro le 12:30.'
              : 'Light Lunch is available from Monday to Sunday (except Wednesday). Orders must be placed by 12:00 and picked up by 12:30.'}
          </p>
          <PickupTimeSelector
            selectedTime={pickupTime || ""}
            onTimeSelect={updatePickupTime}
            language={language}
          />
        </div>
      )}

      {/* Regular Items Information */}
      {hasRegularItems && !hasLightLunchItems && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">
                {language === 'it' ? 'Informazioni Consegna' : 'Delivery Information'}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {t.regularDeliveryNote}
              </p>
            </div>
          </div>
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

