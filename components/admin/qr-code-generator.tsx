"use client"

import { useState, useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import JSZip from "jszip"

type Location = {
  _id: string
  type: 'camera' | 'piscina' | 'giardino'
  name: string
  translations: {
    it: string
    en: string
  }
}

type LocationType = 'camera' | 'piscina' | 'giardino' | 'all'

const locationTypeLabels: Record<LocationType, string> = {
  all: 'Tutte le posizioni',
  camera: 'Camere',
  piscina: 'Piscina',
  giardino: 'Giardino'
}

export default function QRCodeGenerator() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<LocationType>('all')
  const [isDownloading, setIsDownloading] = useState(false)

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

  const downloadAllQR = async () => {
    try {
      setIsDownloading(true)
      const zip = new JSZip()
      const filteredLocations = selectedType === 'all' 
        ? locations 
        : locations.filter(loc => loc.type === selectedType)

      // Crea una cartella per il tipo selezionato
      const folderName = selectedType === 'all' ? 'tutte-le-posizioni' : locationTypeLabels[selectedType].toLowerCase()
      const folder = zip.folder(folderName)

      // Aggiungi ogni QR code al zip
      for (const location of filteredLocations) {
        const canvas = document.getElementById(`qr-${location._id}`) as HTMLCanvasElement
        if (canvas) {
          const pngData = canvas.toDataURL("image/png").split(',')[1]
          const fileName = `qr-${location.name.toLowerCase().replace(/\s+/g, '-')}.png`
          folder?.file(fileName, pngData, { base64: true })
        }
      }

      // Genera e scarica il file zip
      const content = await zip.generateAsync({ type: "blob" })
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(content)
      downloadLink.download = `qr-codes-${folderName}.zip`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(downloadLink.href)
    } catch (error) {
      console.error('Errore durante la creazione del file zip:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const filteredLocations = selectedType === 'all' 
    ? locations 
    : locations.filter(loc => loc.type === selectedType)

  if (loading) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">QR Code Generator</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Select value={selectedType} onValueChange={(value: LocationType) => setSelectedType(value)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Seleziona categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(locationTypeLabels).map(([type, label]) => (
                <SelectItem key={type} value={type}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={downloadAllQR} 
            className="w-full md:w-auto"
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Creazione ZIP...' : `Scarica ${selectedType === 'all' ? 'Tutti' : locationTypeLabels[selectedType]}`}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => (
          <Card key={location._id}>
            <CardHeader>
              <CardTitle className="text-center">{location.translations.it}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <QRCodeCanvas
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