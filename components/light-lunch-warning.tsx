"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LightLunchWarningProps {
  language: string
}

export default function LightLunchWarning({ language }: LightLunchWarningProps) {
  const [isAvailable, setIsAvailable] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [orderDeadline, setOrderDeadline] = useState<string>("12:00")

  useEffect(() => {
    // Carica le impostazioni del Light Lunch
    const fetchSettings = async () => {
      try {
        // Assumiamo che ci sia un endpoint per ottenere la categoria "lightLunch"
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

  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentDay = now.getDay() // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato

      // Verifica se è mercoledì
      if (currentDay === 3) { // 3 = Mercoledì
        setIsAvailable(false)
        return
      }

      // Verifica orario minimo (9:00)
      if (currentHour < 9) {
        setIsAvailable(false)
        return
      }

      // Estrai ore e minuti dall'orario limite
      const [deadlineHours, deadlineMinutes] = orderDeadline.split(':').map(Number)
      
      // Verifica l'orario confrontando con l'orario limite
      if (currentHour > deadlineHours || (currentHour === deadlineHours && currentMinutes >= deadlineMinutes)) {
        setIsAvailable(false)
        return
      }

      // Calcola il tempo rimanente
      const deadline = new Date()
      deadline.setHours(deadlineHours, deadlineMinutes, 0, 0)
      const diff = deadline.getTime() - now.getTime()
      
      if (diff <= 0) {
        setIsAvailable(false)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeLeft(`${hours}h ${minutes}m`)
      setIsAvailable(true)
    }

    checkAvailability()
    const interval = setInterval(checkAvailability, 60000) // Aggiorna ogni minuto
    return () => clearInterval(interval)
  }, [orderDeadline])

  if (isAvailable) {
    return (
      <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="font-medium">
          {language === 'it' ? 'Light Lunch Disponibile' : 'Light Lunch Available'}
        </AlertTitle>
        <AlertDescription>
          {language === 'it' 
            ? `È possibile ordinare fino alle ${orderDeadline}. Tempo rimanente per ordinare: ${timeLeft}`
            : `You can order until ${orderDeadline}. Time remaining to order: ${timeLeft}`}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-medium">
        {language === 'it' ? 'Light Lunch Non Disponibile' : 'Light Lunch Not Available'}
      </AlertTitle>
      <AlertDescription>
        {language === 'it'
          ? `Il Light Lunch è disponibile per l'ordinazione dal lunedì alla domenica (escluso mercoledì) dalle 9:00 alle ${orderDeadline}`
          : `Light Lunch is available for ordering from Monday to Sunday (except Wednesday) from 9:00 to ${orderDeadline}`}
      </AlertDescription>
    </Alert>
  )
} 