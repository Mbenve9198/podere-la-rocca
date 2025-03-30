"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

type LocationType = {
  _id: string;
  type: 'camera' | 'piscina' | 'giardino';
  name: string;
  translations: {
    it: string;
    en: string;
  };
  available: boolean;
  order: number;
}

type LocationSelectorProps = {
  onSelectLocation: (location: string) => void
  onSelectDetail: (detail: string | null) => void
  language: string
}

export default function LocationSelector({ onSelectLocation, onSelectDetail, language }: LocationSelectorProps) {
  const [selectedLocationType, setSelectedLocationType] = useState<string | null>(null)
  const [locations, setLocations] = useState<LocationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    it: {
      camera: "CAMERA",
      piscina: "PISCINA",
      giardino: "GIARDINO",
      back: "Indietro",
      umbrella: "Ombrellone",
      loading: "Caricamento...",
      error: "Errore nel caricamento delle posizioni"
    },
    en: {
      camera: "ROOM",
      piscina: "POOL",
      giardino: "GARDEN",
      back: "Back",
      umbrella: "Umbrella",
      loading: "Loading...",
      error: "Error loading locations"
    },
  }

  const t = translations[language as keyof typeof translations]

  // Carica le posizioni dal database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/locations');
        if (!response.ok) {
          throw new Error('Errore nel caricamento delle posizioni');
        }
        const data = await response.json();
        setLocations(data.data);
        setError(null);
      } catch (err) {
        console.error('Errore nel caricamento delle posizioni:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Filtra le posizioni in base al tipo selezionato
  const locationsByType = (type: string) => {
    return locations.filter(location => location.type === type);
  };

  // Mostra un messaggio di caricamento se i dati non sono ancora pronti
  if (loading) {
    return (
      <div className="w-full max-w-md text-center py-8">
        <p className="text-gray-600">{t.loading}</p>
      </div>
    );
  }

  // Mostra un messaggio di errore se il caricamento fallisce
  if (error) {
    return (
      <div className="w-full max-w-md text-center py-8">
        <p className="text-red-500">{t.error}</p>
      </div>
    );
  }

  // Se un tipo di posizione è selezionato, mostra i dettagli
  if (selectedLocationType) {
    return (
      <div className="w-full max-w-md">
        <button onClick={() => setSelectedLocationType(null)} className="flex items-center text-black mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t.back}
        </button>

        <div className="grid grid-cols-1 gap-3 mt-4">
          {selectedLocationType === "camera" &&
            locationsByType("camera").map((room) => (
              <button
                key={room._id}
                onClick={() => {
                  onSelectLocation(selectedLocationType);
                  onSelectDetail(room.name);
                }}
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mr-3">🛏️</span>
                <span className="font-medium text-black">{room.name}</span>
              </button>
            ))}

          {selectedLocationType === "piscina" &&
            locationsByType("piscina").map((umbrella) => (
              <button
                key={umbrella._id}
                onClick={() => {
                  onSelectLocation(selectedLocationType);
                  onSelectDetail(umbrella.name);
                }}
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <span className="text-2xl mr-3">🏖️</span>
                <span className="font-medium text-black">{umbrella.name}</span>
              </button>
            ))}

          {selectedLocationType === "giardino" && (
            <button
              onClick={() => {
                onSelectLocation(selectedLocationType);
                onSelectDetail(null);
              }}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">🌳</span>
              <span className="font-medium text-black">{t.giardino}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Mostra i tipi di posizione disponibili
  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-1 gap-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3,
            ease: "easeInOut",
          }}
          onClick={() => setSelectedLocationType("camera")}
          className="relative flex flex-col items-center"
        >
          <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/images/camera.png" alt="Camera" width={120} height={120} className="object-contain" />
          </div>
          <span className="mt-2 text-lg font-playful text-black uppercase tracking-tight">{t.camera}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3.5,
            ease: "easeInOut",
            delay: 0.5,
          }}
          onClick={() => setSelectedLocationType("piscina")}
          className="relative flex flex-col items-center"
        >
          <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/images/piscina.png" alt="Piscina" width={120} height={120} className="object-contain" />
          </div>
          <span className="mt-2 text-lg font-playful text-black uppercase tracking-tight">{t.piscina}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 4,
            ease: "easeInOut",
            delay: 1,
          }}
          onClick={() => setSelectedLocationType("giardino")}
          className="relative flex flex-col items-center"
        >
          <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/images/garden.png" alt="Giardino" width={120} height={120} className="object-contain" />
          </div>
          <span className="mt-2 text-lg font-playful text-black uppercase tracking-tight">{t.giardino}</span>
        </motion.button>
      </div>
    </div>
  )
}

