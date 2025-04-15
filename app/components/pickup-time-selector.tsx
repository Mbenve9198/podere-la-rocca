"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface PickupTimeSelectorProps {
  selectedTime: string
  onTimeSelect: (time: string) => void
  language: string
}

export default function PickupTimeSelector({ selectedTime, onTimeSelect, language }: PickupTimeSelectorProps) {
  const times = ["11:30", "11:45", "12:00", "12:15", "12:30"]

  return (
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
  )
} 