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

      // Verifica l'orario
      if (currentHour >= 12) {
        setIsAvailable(false)
        return
      }

      // Calcola il tempo rimanente
      const deadline = new Date()
      deadline.setHours(12, 0, 0, 0)
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
  }, [])

  if (isAvailable) {
    return (
      <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="font-medium">
          {language === 'it' ? 'Light Lunch Disponibile' : 'Light Lunch Available'}
        </AlertTitle>
        <AlertDescription>
          {language === 'it' 
            ? `Le ordinazioni sono aperte fino alle 12:00. Tempo rimanente: ${timeLeft}`
            : `Orders are open until 12:00. Time remaining: ${timeLeft}`}
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
          ? 'Il Light Lunch è disponibile dal lunedì alla domenica (escluso mercoledì) dalle 9:00 alle 12:00'
          : 'Light Lunch is available from Monday to Sunday (except Wednesday) from 9:00 to 12:00'}
      </AlertDescription>
    </Alert>
  )
} 