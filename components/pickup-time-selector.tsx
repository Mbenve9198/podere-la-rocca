"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface PickupTimeSelectorProps {
  selectedTime: string
  onTimeSelect: (time: string) => void
  language: string
}

export default function PickupTimeSelector({ selectedTime, onTimeSelect, language }: PickupTimeSelectorProps) {
  const times = ["11:30", "11:45", "12:00", "12:15", "12:30"]

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
          ? 'L\'ordine deve essere ritirato entro le 12:30'
          : 'Order must be picked up by 12:30'}
      </p>
    </div>
  )
} 