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
import Image from "next/image"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ExperienceCarousel } from "@/components/ui/experience-carousel"
import { ExperienceBanner } from "@/components/ui/experience-banner"
import { ExperienceToast } from "@/components/ui/experience-toast"
import { ExperienceDialog } from "@/components/ui/experience-dialog"

type Order = {
  id: string
  items: { id: string; name: string; price: number; quantity: number }[]
  total: number
  status: "waiting" | "processing" | "completed"
  timestamp: number
  location: string | null
  locationDetail: string | null
  pickupTime?: string
}

export default function Home() {
  const searchParams = useSearchParams()
  const [location, setLocation] = useState<string | null>(null)
  const [locationDetail, setLocationDetail] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [language, setLanguage] = useState("it") // Default language is Italian
  const [step, setStep] = useState("location")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showExperienceToast, setShowExperienceToast] = useState(false)
  const [toastRelatedCategory, setToastRelatedCategory] = useState<string | undefined>(undefined)
  const [showExperienceDialog, setShowExperienceDialog] = useState(false)
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | undefined>(undefined)

  // Recupera il nome cliente dal localStorage al caricamento del componente
  useEffect(() => {
    const savedCustomerName = localStorage.getItem('customerName');
    if (savedCustomerName) {
      setName(savedCustomerName);
    }
  }, []);

  // Salva il nome del cliente nel localStorage quando viene aggiornato
  const updateCustomerName = (newName: string) => {
    setName(newName);
    localStorage.setItem('customerName', newName);
  }

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
      viewOrders: "I miei ordini",
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
      viewOrders: "My orders",
    },
  }

  const t = translations[language as keyof typeof translations]

  // Traduzioni comuni per tutti gli header
  const commonTrans = {
    it: {
      viewOrders: "I miei ordini",
      back: "Indietro"
    },
    en: {
      viewOrders: "My orders",
      back: "Back"
    }
  };

  // Componente Header riutilizzabile per mantenere coerenza tra le pagine
  const Header = ({ 
    showBackButton = false, 
    onBackClick = () => {}, 
    hideLanguageButton = false,
    hideOrdersButton = false  // Aggiungo questo parametro invece di showOrdersButton
  }) => {
    const c = commonTrans[language as keyof typeof commonTrans];
    
    return (
      <header className="flex justify-between items-center p-4 bg-amber-50 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div>
          {showBackButton && (
            <button 
              onClick={onBackClick} 
              className="flex items-center text-black px-3 py-2 rounded-md hover:bg-amber-100 touch-manipulation"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              {c.back}
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!hideOrdersButton && step !== "order-history" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setStep("order-history")} 
              className="text-black border-amber-300 bg-amber-100 hover:bg-amber-200 h-10 px-3 touch-manipulation"
            >
              {c.viewOrders}
            </Button>
          )}
          
          {!hideLanguageButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLanguageSelector(true)} 
              className="text-black h-10 w-10 p-0 touch-manipulation"
            >
              <LanguageFlag language={language} />
            </Button>
          )}
        </div>
      </header>
    );
  };

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
    
    // Mostra l'indicatore di caricamento
    setIsLoading(true);
    
    // Converti il nome della categoria nell'ID corrispondente
    const categoryId = categoryIdMap[category] || category;
    
    setSelectedCategory(categoryId);
    setStep("menu");
    
    // Nascondi l'indicatore di caricamento dopo un breve ritardo
    // per assicurarsi che il componente Menu abbia il tempo di mostrare la propria animazione
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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

  const updateLocation = (newLocation: string | null, newDetail: string | null) => {
    setLocation(newLocation)
    setLocationDetail(newDetail)
    if (!newLocation) {
      setStep("location")
    }
  }

  const handlePlaceOrder = async (pickupTime?: string) => {
    try {
      // Mostra indicatore di caricamento
      setIsLoading(true);
      
      // Salva il nome del cliente prima di inviare l'ordine
      localStorage.setItem('customerName', name);
      
      // Prepara i dati dell'ordine
      const orderData = {
        customerName: name,
        location,
        locationDetail,
        items: cart,
        pickupTime,
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
          pickupTime,
        };
        
        // Imposta la categoria correlata per il toast in base agli elementi nel carrello
        // Trova la categoria più comune negli articoli del carrello
        const categoryCounts: Record<string, number> = {};
        cart.forEach(item => {
          if (item.id.startsWith("67e9424db092d6d1d2ff8524")) {
            categoryCounts["67e9424db092d6d1d2ff8524"] = (categoryCounts["67e9424db092d6d1d2ff8524"] || 0) + 1;
          } else if (item.id.startsWith("67e9424db092d6d1d2ff8525")) {
            categoryCounts["67e9424db092d6d1d2ff8525"] = (categoryCounts["67e9424db092d6d1d2ff8525"] || 0) + 1;
          } else if (item.id.startsWith("67e9424db092d6d1d2ff8526")) {
            categoryCounts["67e9424db092d6d1d2ff8526"] = (categoryCounts["67e9424db092d6d1d2ff8526"] || 0) + 1;
          } else if (item.id.startsWith("67e9424db092d6d1d2ff8527")) {
            categoryCounts["67e9424db092d6d1d2ff8527"] = (categoryCounts["67e9424db092d6d1d2ff8527"] || 0) + 1;
          }
        });
        
        let mostCommonCategory: string | undefined;
        let maxCount = 0;
        
        Object.entries(categoryCounts).forEach(([category, count]) => {
          if (count > maxCount) {
            mostCommonCategory = category;
            maxCount = count;
          }
        });
        
        setToastRelatedCategory(mostCommonCategory);
        
        setOrders([newOrder, ...orders]);
        setCart([]);
        setStep("order-history");
        
        // Mostra il toast dopo un breve ritardo
        setTimeout(() => {
          setShowExperienceToast(true);
        }, 1000);
      } else {
        console.error('Errore dal server:', result);
        // Qui potresti mostrare un messaggio di errore all'utente
      }
    } catch (error) {
      console.error('Errore durante l\'invio dell\'ordine:', error);
      // Qui potresti mostrare un messaggio di errore all'utente
    } finally {
      // Nascondi indicatore di caricamento
      setIsLoading(false);
    }
  };

  const handleNewOrder = () => {
    setStep("menu-categories")
  }

  // Funzione per aprire il dialog delle esperienze
  const handleOpenExperienceDialog = (experienceId: string) => {
    setSelectedExperienceId(experienceId)
    setShowExperienceDialog(true)
  }

  // Location selection step
  if (step === "location") {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <Header hideLanguageButton={false} hideOrdersButton={false} />
        
        <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
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
        <Header 
          hideOrdersButton={false}
          hideLanguageButton={false}
        />
        
        <main className="flex-1 flex flex-col items-center p-6 pt-20">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-8">
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
                    className="text-gray-800 hover:text-black hover:bg-amber-100 touch-manipulation"
                  >
                    {t.changeLocation}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-8 bg-amber-500 hover:bg-amber-600 text-white font-playful uppercase tracking-wide h-12 touch-manipulation"
              disabled={!name.trim()}
              onClick={handleStartOrdering}
            >
              {t.startButton} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Carosello delle esperienze */}
          <ExperienceCarousel 
            language={language}
            className="w-full max-w-md"
            onClickExperience={handleOpenExperienceDialog}
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

  // Order history step
  if (step === "order-history") {
    return (
      <div className="flex flex-col min-h-screen bg-amber-100">
        <Header 
          showBackButton={true} 
          onBackClick={() => setStep("user-info")} 
          hideLanguageButton={false}
        />
        
        <main className="flex-1 flex flex-col items-center p-4 pt-20">
          <OrderHistory language={language} onNewOrder={handleNewOrder} customerName={name} onClickExperience={handleOpenExperienceDialog} />
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
        <Header 
          showBackButton={true} 
          onBackClick={() => setStep(orders.length > 0 ? "order-history" : "user-info")} 
          hideLanguageButton={false}
        />
        
        <main className="flex-1 flex flex-col items-center p-4 pt-20">
          {/* Banner con esperienze */}
          <ExperienceBanner 
            language={language}
            className="mb-6 max-w-md"
            onClickExperience={handleOpenExperienceDialog}
          />
          
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
        <Header 
          showBackButton={true} 
          onBackClick={handleBackFromMenu} 
          hideLanguageButton={false}
        />
        
        <main className="flex-1 flex flex-col items-center p-4 pt-20">
          {/* Banner con esperienze correlate alla categoria */}
          <ExperienceBanner 
            language={language}
            category={selectedCategory}
            className="mb-6 max-w-md"
            onClickExperience={handleOpenExperienceDialog}
          />
          
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
        <Header 
          showBackButton={true} 
          onBackClick={handleBackFromSummary} 
          hideLanguageButton={false}
        />
        
        <main className="flex-1 flex flex-col items-center p-4 pt-20">
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

  return (
    <div className="flex flex-col min-h-screen bg-amber-100">
      {isLoading && <LoadingScreen fullScreen={true} />}
      
      <Header 
        showBackButton={true} 
        onBackClick={() => setStep(orders.length > 0 ? "order-history" : "user-info")} 
        hideOrdersButton={step === "order-history"}
        hideLanguageButton={false}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
        {step === "location" && (
          <>
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
          </>
        )}
        {step === "user-info" && (
          <>
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
                      className="text-gray-800 hover:text-black hover:bg-amber-100 touch-manipulation"
                    >
                      {t.changeLocation}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-8 bg-amber-500 hover:bg-amber-600 text-white font-playful uppercase tracking-wide h-12 touch-manipulation"
                disabled={!name.trim()}
                onClick={handleStartOrdering}
              >
                {t.startButton} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        {step === "order-history" && (
          <OrderHistory language={language} onNewOrder={handleNewOrder} customerName={name} onClickExperience={handleOpenExperienceDialog} />
        )}
        {step === "menu-categories" && (
          <MenuCategories language={language} onSelectCategory={handleSelectCategory} />
        )}
        {step === "menu" && selectedCategory && (
          <Menu
            language={language}
            category={selectedCategory}
            onBack={handleBackFromMenu}
            onProceedToSummary={handleProceedToSummary}
          />
        )}
        {step === "order-summary" && (
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
        )}
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
      
      {/* Toast con proposta di esperienze correlate */}
      <ExperienceToast
        language={language}
        show={showExperienceToast}
        onClose={() => setShowExperienceToast(false)}
        relatedCategory={toastRelatedCategory}
        onClickExperience={handleOpenExperienceDialog}
      />
      
      {/* Dialog per i dettagli delle esperienze */}
      <ExperienceDialog
        isOpen={showExperienceDialog}
        onClose={() => setShowExperienceDialog(false)}
        initialExperienceId={selectedExperienceId}
        language={language}
      />
    </div>
  )
}

// Helper component to show the appropriate icon based on location
function LocationIcon({ location }: { location: string }) {
  switch (location) {
    case "camera":
      return <span className="text-2xl">🏠</span>
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

