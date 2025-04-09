"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

interface LightLunchSettingsProps {
  categoryId: string
}

export default function LightLunchSettings({ categoryId }: LightLunchSettingsProps) {
  const [settings, setSettings] = useState({
    order_deadline: "12:00",
    available_days: ["monday", "tuesday", "thursday", "friday", "saturday", "sunday"]
  })

  useEffect(() => {
    // Carica le impostazioni esistenti
    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}`)
        const data = await response.json()
        if (data.success) {
          setSettings({
            order_deadline: data.data.order_deadline || "12:00",
            available_days: data.data.available_days || ["monday", "tuesday", "thursday", "friday", "saturday", "sunday"]
          })
        }
      } catch (error) {
        console.error("Errore nel caricamento delle impostazioni:", error)
      }
    }

    loadSettings()
  }, [categoryId])

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Impostazioni salvate con successo")
      } else {
        toast.error("Errore nel salvataggio delle impostazioni")
      }
    } catch (error) {
      console.error("Errore nel salvataggio:", error)
      toast.error("Errore di connessione al server")
    }
  }

  const toggleDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }))
  }

  const dayNames = {
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica"
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900">Impostazioni Light Lunch</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Orario limite per le ordinazioni
          </label>
          <input
            type="time"
            value={settings.order_deadline}
            onChange={(e) => setSettings(prev => ({ ...prev, order_deadline: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giorni disponibili
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(dayNames).map(([key, name]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={key}
                  checked={settings.available_days.includes(key)}
                  onChange={() => toggleDay(key)}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor={key} className="ml-2 block text-sm text-gray-700">
                  {name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          Salva Impostazioni
        </Button>
      </div>
    </div>
  )
} 