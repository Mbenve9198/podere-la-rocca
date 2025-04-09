"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

type Location = {
  _id: string
  type: 'camera' | 'piscina' | 'giardino'
  name: string
  translations: {
    it: string
    en: string
  }
}

export default function QRCodeGenerator() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations')
        const data = await response.json()
        if (data.success) {
          setLocations(data.data)
        }
      } catch (error) {
        console.error('Errore nel caricamento delle posizioni:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const downloadQRCode = (location: Location) => {
    const canvas = document.getElementById(`qr-${location._id}`) as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `qr-${location.name.toLowerCase().replace(/\s+/g, '-')}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const downloadAllQR = () => {
    locations.forEach(location => {
      downloadQRCode(location)
    })
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">QR Code Generator</h2>
        <Button onClick={downloadAllQR}>
          <Download className="mr-2 h-4 w-4" />
          Scarica Tutti
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Card key={location._id}>
            <CardHeader>
              <CardTitle className="text-center">{location.translations.it}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <QRCodeSVG
                id={`qr-${location._id}`}
                value={`https://www.poderelarocca.app/?location=${location.type}&detail=${encodeURIComponent(location.name)}`}
                size={200}
                level="H"
                includeMargin={true}
              />
              <Button onClick={() => downloadQRCode(location)}>
                <Download className="mr-2 h-4 w-4" />
                Scarica
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 