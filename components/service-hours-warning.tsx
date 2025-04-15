"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ServiceHoursWarningProps {
  language: string
}

export default function ServiceHoursWarning({ language }: ServiceHoursWarningProps) {
  const [isAvailable, setIsAvailable] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [currentPeriod, setCurrentPeriod] = useState<"morning" | "afternoon" | null>(null)

  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentDay = now.getDay() // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
      
      // Verifica se è mercoledì pomeriggio
      if (currentDay === 3 && currentHour >= 13) {
        setIsAvailable(false)
        setCurrentPeriod(null)
        return
      }

      // Verifica gli orari di servizio
      const morningStart = 11
      const morningEnd = 12.5 // 12:30
      const afternoonStart = 16
      const afternoonEnd = 19

      const currentTime = currentHour + (currentMinutes / 60)

      // Determina il periodo corrente e calcola il tempo rimanente
      if (currentTime >= morningStart && currentTime < morningEnd) {
        setIsAvailable(true)
        setCurrentPeriod("morning")
        const minutesLeft = Math.round((morningEnd - currentTime) * 60)
        const hours = Math.floor(minutesLeft / 60)
        const minutes = minutesLeft % 60
        setTimeLeft(`${hours}h ${minutes}m`)
      } else if (currentTime >= afternoonStart && currentTime < afternoonEnd) {
        setIsAvailable(true)
        setCurrentPeriod("afternoon")
        const minutesLeft = Math.round((afternoonEnd - currentTime) * 60)
        const hours = Math.floor(minutesLeft / 60)
        const minutes = minutesLeft % 60
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setIsAvailable(false)
        setCurrentPeriod(null)
      }
    }

    checkAvailability()
    const interval = setInterval(checkAvailability, 60000) // Aggiorna ogni minuto
    return () => clearInterval(interval)
  }, [])

  if (isAvailable) {
    return (
      <Alert className="bg-green-50 border-green-200 text-green-800 mb-4">
        <AlertCircle className="h-4 w-4 text-green-500" />
        <AlertTitle className="font-medium">
          {language === 'it' ? 'Servizio Disponibile' : 'Service Available'}
        </AlertTitle>
        <AlertDescription>
          {language === 'it'
            ? `Il servizio è attivo. Tempo rimanente in questa fascia: ${timeLeft}`
            : `Service is active. Time remaining in this period: ${timeLeft}`}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-medium">
        {language === 'it' ? 'Servizio Non Disponibile' : 'Service Not Available'}
      </AlertTitle>
      <AlertDescription>
        {language === 'it'
          ? 'Il servizio è disponibile dalle 11:00 alle 12:30 e dalle 16:00 alle 19:00, tutti i giorni (servizio sospeso il mercoledì pomeriggio)'
          : 'Service is available from 11:00 to 12:30 and from 16:00 to 19:00, every day (service suspended on Wednesday afternoon)'}
      </AlertDescription>
    </Alert>
  )
} 