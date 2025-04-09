"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PickupTimeSelectorProps {
  onTimeSelect: (time: string) => void
  disabled?: boolean
}

export default function PickupTimeSelector({ onTimeSelect, disabled = false }: PickupTimeSelectorProps) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")

  useEffect(() => {
    // Genera gli orari disponibili dalle 9:00 alle 12:30 con intervalli di 30 minuti
    const times: string[] = []
    for (let hour = 9; hour <= 12; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 12) {
        times.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    setAvailableTimes(times)
  }, [])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    onTimeSelect(time)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Orario di ritiro
      </label>
      <Select
        value={selectedTime}
        onValueChange={handleTimeSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleziona l'orario di ritiro" />
        </SelectTrigger>
        <SelectContent>
          {availableTimes.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        L'ordine deve essere ritirato entro le 12:30
      </p>
    </div>
  )
} 