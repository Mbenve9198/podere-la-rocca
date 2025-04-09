"use client"

import { useState } from "react"
import { Plus, Minus, Clock, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type MenuItemProps = {
  id: string
  name: string
  description: string
  price: number
  category: string
  translations: {
    it: string
    en: string
  }
  language: string
  onAddToCart: (id: string, name: string, price: number) => void
  onRemoveFromCart: (id: string) => void
  quantity: number
}

export default function MenuItem({
  id,
  name,
  description,
  price,
  category,
  translations,
  language,
  onAddToCart,
  onRemoveFromCart,
  quantity,
}: MenuItemProps) {
  const [showInfo, setShowInfo] = useState(false)
  const isLightLunch = category === 'light-lunch'

  const handleAddToCart = () => {
    if (isLightLunch) {
      setShowInfo(true)
    } else {
      onAddToCart(id, name, price)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          {isLightLunch && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="h-3 w-3 mr-1" />
                {language === 'it' ? 'Ritiro al ristorante' : 'Pickup at restaurant'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => setShowInfo(true)}
              >
                <Info className="h-3 w-3 mr-1" />
                {language === 'it' ? 'Info' : 'Info'}
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="font-medium text-gray-900">€{price.toFixed(2)}</span>
          <div className="flex items-center gap-2 mt-2">
            {quantity > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onRemoveFromCart(id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleAddToCart}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleAddToCart}
              >
                <Plus className="h-4 w-4 mr-1" />
                {language === 'it' ? 'Aggiungi' : 'Add'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center font-playful text-black">
              {language === 'it' ? 'Informazioni Light Lunch' : 'Light Lunch Information'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                {language === 'it' ? 'Disponibilità' : 'Availability'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'it' 
                  ? 'Dal lunedì alla domenica (escluso mercoledì)'
                  : 'Monday to Sunday (except Wednesday)'}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                {language === 'it' ? 'Orario ordinazioni' : 'Ordering hours'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'it' 
                  ? 'Dalle ore 9:00 alle ore 12:00'
                  : 'From 9:00 AM to 12:00 PM'}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                {language === 'it' ? 'Ritiro' : 'Pickup'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'it' 
                  ? 'Il Light Lunch va ordinato entro le ore 12:00 dello stesso giorno e ritirato al ristorante entro le ore 12:30. Al momento dell\'ordinazione, vi chiediamo gentilmente di comunicarci l\'orario esatto in cui desiderate effettuare il ritiro.'
                  : 'Light Lunch must be ordered by 12:00 PM on the same day and picked up at the restaurant by 12:30 PM. When ordering, please let us know the exact time you would like to pick up your order.'}
              </p>
            </div>
            <div className="pt-4">
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  setShowInfo(false)
                  onAddToCart(id, name, price)
                }}
              >
                {language === 'it' ? 'Procedi con l\'ordinazione' : 'Proceed with order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 