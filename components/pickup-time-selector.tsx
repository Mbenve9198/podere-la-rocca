"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface PickupTimeSelectorProps {
  selectedTime: string
  onTimeSelect: (time: string) => void
  language: string
}

export default function PickupTimeSelector({ selectedTime, onTimeSelect, language }: PickupTimeSelectorProps) {
  const [times, setTimes] = useState(["11:30", "11:45", "12:00", "12:15", "12:30"])
  const [orderDeadline, setOrderDeadline] = useState<string>("12:00")

  useEffect(() => {
    // Carica le impostazioni del Light Lunch
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/categories?name=lightLunch')
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          const settings = data.data[0]
          if (settings.order_deadline) {
            setOrderDeadline(settings.order_deadline)
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni:", error)
      }
    }

    fetchSettings()
  }, [])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {language === 'it' ? 'Orario di ritiro' : 'Pickup Time'}
      </label>
      <Select value={selectedTime} onValueChange={onTimeSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={language === 'it' ? "Seleziona orario" : "Select time"} />
        </SelectTrigger>
        <SelectContent>
          {times.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        {language === 'it' 
          ? `È possibile ritirare l'ordine fino alle 12:30`
          : `You can pick up your order until 12:30`}
      </p>
    </div>
  )
} 