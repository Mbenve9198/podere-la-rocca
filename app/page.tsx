"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LocationSelector from "@/components/location-selector"
import LanguageSelector from "@/components/language-selector"
import MenuCategories from "./menu-categories"
import Menu from "./menu"
import OrderSummary from "./order-summary"
import OrderHistory from "./order-history"
import { v4 as uuidv4 } from "uuid"

type Order = {
  id: string
  items: { id: string; name: string; price: number; quantity: number }[]
  total: number
  status: "waiting" | "processing" | "completed"
  timestamp: number
  location: string | null
  locationDetail: string | null
}

export default function Home() {
  const searchParams = useSearchParams()
  const [location, setLocation] = useState<string | null>(null)
  const [locationDetail, setLocationDetail] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [language, setLanguage] = useState("it") // Default language is Italian
  const [step, setStep] = useState<
    "location" | "user-info" | "menu-categories" | "menu" | "order-summary" | "order-history"
  >("location")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Check if location is provided in URL (from QR code)
  useEffect(() => {
    const locationParam = searchParams.get("location")
    const detailParam = searchParams.get("detail")

    if (locationParam) {
      setLocation(locationParam)
      setStep("user-info")
    }

    if (detailParam) {
      setLocationDetail(detailParam)
    }
  }, [searchParams])

  // Translations
  const translations = {
    it: {
      subtitle: "ORDINA DIRETTAMENTE DALLA TUA POSIZIONE",
      nameLabel: "Nome e Cognome",
      namePlaceholder: "Inserisci il tuo nome e cognome",
      locationLabel: "La tua posizione",
      changeLocation: "Cambia",
      startButton: "INIZIA",
      selectLocation: "SELEZIONA LA TUA POSIZIONE",
      back: "Indietro",
    },
    en: {
      subtitle: "ORDER DIRECTLY FROM YOUR LOCATION",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",
      locationLabel: "Your location",
      changeLocation: "Change",
      startButton: "START",
      selectLocation: "SELECT YOUR LOCATION",
      back: "Back",
    },
  }

  const t = translations[language as keyof typeof translations]

  const handleStartOrdering = () => {
    // If there are existing orders, show order history first
    if (orders.length > 0) {
      setStep("order-history")
    } else {
      setStep("menu-categories")
    }
  }

  const handleSelectCategory = (category: string) => {
    // Mappa da nomi di categoria a ID MongoDB
    const categoryIdMap: Record<string, string> = {
      cocktails: "67e9424db092d6d1d2ff8524",
      softDrinks: "67e9424db092d6d1d2ff8525",
      caffetteria: "67e9424db092d6d1d2ff8526",
      lightLunch: "67e9424db092d6d1d2ff8527",
      // Aggiungi qui tutte le altre categorie se necessario
    };
    
    // Converti il nome della categoria nell'ID corrispondente
    const categoryId = categoryIdMap[category] || category;
    
    setSelectedCategory(categoryId);
    setStep("menu");
  }

  const handleBackFromMenu = () => {
    setStep("menu-categories")
    setSelectedCategory(null)
  }

  const handleProceedToSummary = (cartItems: { id: string; name: string; price: number; quantity: number }[]) => {
    setCart(cartItems)
    setStep("order-summary")
  }

  const handleBackFromSummary = () => {
    setStep("menu")
  }

  const updateCart = (newCart: { id: string; name: string; price: number; quantity: number }[]) => {
    setCart(newCart)
  }

  const updateCustomerName = (newName: string) => {
    setName(newName)
  }

  const updateLocation = (newLocation: string | null, newDetail: string | null) => {
    setLocation(newLocation)
    setLocationDetail(newDetail)
    if (!newLocation) {
      setStep("location")
    }
  }

  const handlePlaceOrder = async () => {
    try {
      // Prepara i dati dell'ordine
      const orderData = {
        customerName: name,
        location,
        locationDetail,
        items: cart,
      };
      
      // Effettua la chiamata API per creare l'ordine
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Ordine creato con successo:', result);
        
        // Crea l'ordine locale per la visualizzazione nella cronologia
        const newOrder: Order = {
          id: result.data.id || uuidv4(), // Usa l'ID dal server se disponibile
          items: [...cart],
          total: cart.reduce((total, item) => total + item.price * item.quantity, 0),
          status: "waiting",
          timestamp: Date.now(),
          location,
          locationDetail,
        };
        
        setOrders([newOrder, ...orders]);
        setCart([]);
        setStep("order-history");
      } else {
        console.error('Errore nella creazione dell\'ordine:', result.message);
        // Qui potresti mostrare un messaggio di errore all'utente
      }
    } catch (error) {
      console.error('Errore durante l\'invio dell\'ordine:', error);
      // Qui potresti mostrare un messaggio di errore all'utente
    }
  };

  const handleNewOrder = () => {
    setStep("menu-categories")
  }

  // Location selection step
  if (step === "location") {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <header className="flex justify-end items-center p-4">
          <Button variant="ghost" size="sm" onClick={() => setShowLanguageSelector(true)} className="text-black">
            <LanguageFlag language={language} />
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-playful text-black mb-8 text-center uppercase tracking-tight">
            {t.selectLocation}
          </h2>

          <LocationSelector
            onSelectLocation={(loc) => {
              setLocation(loc)
              setStep("user-info")
            }}
            onSelectDetail={setLocationDetail}
            language={language}
          />
        </main>

        {showLanguageSelector && (
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang)
              setShowLanguageSelector(false)
            }}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}
      </div>
    )
  }

  // User info step
  if (step === "user-info") {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <header className="flex justify-end items-center p-4">
          <Button variant="ghost" size="sm" onClick={() => setShowLanguageSelector(true)} className="text-black">
            <LanguageFlag language={language} />
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-playful text-black mb-4 uppercase tracking-tight">{t.subtitle}</h2>

            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
                  {t.nameLabel}
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">{t.locationLabel}</label>
                <div className="flex items-center justify-between bg-amber-50 p-3 rounded-md border border-amber-200">
                  <div className="flex items-center gap-3">
                    <LocationIcon location={location || ""} />
                    <span className="font-medium text-gray-800">
                      {getLocationName(location || "", language)}
                      {locationDetail && ` - ${locationDetail}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLocation(null)
                      setLocationDetail(null)
                      setStep("location")
                    }}
                    className="text-gray-800 hover:text-black hover:bg-amber-100"
                  >
                    {t.changeLocation}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-8 bg-amber-500 hover:bg-amber-600 text-white font-playful uppercase tracking-wide"
              disabled={!name.trim()}
              onClick={handleStartOrdering}
            >
              {t.startButton} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>

        {showLanguageSelector && (
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang)
              setShowLanguageSelector(false)
            }}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}
      </div>
    )
  }

  // Order history step
  if (step === "order-history") {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <header className="flex justify-between items-center p-4">
          <button onClick={() => setStep("user-info")} className="flex items-center text-black">
            <ChevronLeft className="h-5 w-5 mr-1" />
            {translations[language as keyof typeof translations].back}
          </button>
          <Button variant="ghost" size="sm" onClick={() => setShowLanguageSelector(true)} className="text-black">
            <LanguageFlag language={language} />
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center p-4">
          <OrderHistory language={language} onNewOrder={handleNewOrder} customerName={name} />
        </main>

        {showLanguageSelector && (
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang)
              setShowLanguageSelector(false)
            }}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}
      </div>
    )
  }

  // Menu categories step
  if (step === "menu-categories") {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <header className="flex justify-between items-center p-4">
          <button
            onClick={() => setStep(orders.length > 0 ? "order-history" : "user-info")}
            className="flex items-center text-black"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            {translations[language as keyof typeof translations].back}
          </button>
          <Button variant="ghost" size="sm" onClick={() => setShowLanguageSelector(true)} className="text-black">
            <LanguageFlag language={language} />
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <MenuCategories language={language} onSelectCategory={handleSelectCategory} />
        </main>

        {showLanguageSelector && (
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang)
              setShowLanguageSelector(false)
            }}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}
      </div>
    )
  }

  // Menu step
  if (step === "menu" && selectedCategory) {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <header className="flex justify-between items-center p-4">
          <button onClick={handleBackFromMenu} className="flex items-center text-black">
            <ChevronLeft className="h-5 w-5 mr-1" />
            {translations[language as keyof typeof translations].back}
          </button>
          <Button variant="ghost" size="sm" onClick={() => setShowLanguageSelector(true)} className="text-black">
            <LanguageFlag language={language} />
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center p-4">
          <Menu
            language={language}
            category={selectedCategory}
            onBack={handleBackFromMenu}
            onProceedToSummary={handleProceedToSummary}
          />
        </main>

        {showLanguageSelector && (
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang)
              setShowLanguageSelector(false)
            }}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}
      </div>
    )
  }

  // Order summary step
  if (step === "order-summary") {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <header className="flex justify-between items-center p-4">
          <button onClick={handleBackFromSummary} className="flex items-center text-black">
            <ChevronLeft className="h-5 w-5 mr-1" />
            {translations[language as keyof typeof translations].back}
          </button>
          <Button variant="ghost" size="sm" onClick={() => setShowLanguageSelector(true)} className="text-black">
            <LanguageFlag language={language} />
          </Button>
        </header>

        <main className="flex-1 flex flex-col items-center p-4">
          <OrderSummary
            cart={cart}
            updateCart={updateCart}
            customerName={name}
            updateCustomerName={updateCustomerName}
            location={location}
            locationDetail={locationDetail}
            updateLocation={updateLocation}
            onBack={handleBackFromSummary}
            language={language}
            onPlaceOrder={handlePlaceOrder}
          />
        </main>

        {showLanguageSelector && (
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang)
              setShowLanguageSelector(false)
            }}
            onClose={() => setShowLanguageSelector(false)}
          />
        )}
      </div>
    )
  }

  return null
}

// Helper component to show the appropriate icon based on location
function LocationIcon({ location }: { location: string }) {
  switch (location) {
    case "camera":
      return <span className="text-2xl">🛏️</span>
    case "piscina":
      return <span className="text-2xl">🏖️</span>
    case "giardino":
      return <span className="text-2xl">🌳</span>
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-700"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      )
  }
}

// Helper function to get location name based on language
function getLocationName(location: string, language: string): string {
  const locationNames = {
    it: {
      camera: "Camera",
      piscina: "Piscina",
      giardino: "Giardino",
    },
    en: {
      camera: "Room",
      piscina: "Pool",
      giardino: "Garden",
    },
  }

  return locationNames[language as keyof typeof locationNames][location as keyof typeof locationNames.it] || location
}

function LanguageFlag({ language }: { language: string }) {
  return <span className="text-xl">{language === "it" ? "🇮🇹" : "🇬🇧"}</span>
}

