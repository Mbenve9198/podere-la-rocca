"use client"

import { useState, useEffect } from "react"
import { Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import CrossSellingDialog from "@/components/cross-selling-dialog"

type CategoryType = {
  _id: string;
  name: string;
  translations: {
    it: string;
    en: string;
  };
  parent: string | null;
  order: number;
}

type ProductType = {
  _id: string;
  name: string;
  translations: {
    it: string;
    en: string;
  };
  price: number;
  category: string;
  order: number;
}

type MenuProps = {
  language: string
  category: string
  onBack: () => void
  onProceedToSummary: (cart: { id: string; name: string; price: number; quantity: number }[]) => void
}

export default function Menu({ language, category, onBack, onProceedToSummary }: MenuProps) {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([])
  const [activeCategory, setActiveCategory] = useState<string>(category)
  const [activeSubcategory, setActiveSubcategory] = useState<string>("")
  const [showCrossSelling, setShowCrossSelling] = useState(false)
  
  const [mainCategories, setMainCategories] = useState<CategoryType[]>([])
  const [subCategories, setSubCategories] = useState<CategoryType[]>([])
  const [products, setProducts] = useState<Record<string, ProductType[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    it: {
      back: "Indietro",
      cart: "Carrello",
      items: "prodotti",
      total: "Totale",
      euro: "Euro",
      loading: "Caricamento...",
      error: "Errore nel caricamento dei dati"
    },
    en: {
      back: "Back",
      cart: "Cart",
      items: "items",
      total: "Total",
      euro: "Euro",
      loading: "Loading...",
      error: "Error loading data"
    },
  }

  const t = translations[language as keyof typeof translations]

  // Carica le categorie e i prodotti
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Recupera le categorie principali
        const mainCategoriesResponse = await fetch('/api/categories?parent=main');
        if (!mainCategoriesResponse.ok) {
          throw new Error('Errore nel caricamento delle categorie');
        }
        const mainCategoriesData = await mainCategoriesResponse.json();
        setMainCategories(mainCategoriesData.data);
        
        // Recupera le sottocategorie
        const subCategoriesResponse = await fetch('/api/categories?parent=lightLunch');
        if (!subCategoriesResponse.ok) {
          throw new Error('Errore nel caricamento delle sottocategorie');
        }
        const subCategoriesData = await subCategoriesResponse.json();
        setSubCategories(subCategoriesData.data);
        
        // Recupera i prodotti per ogni categoria
        const productsMap: Record<string, ProductType[]> = {};
        
        // Categorie principali
        for (const category of mainCategoriesData.data) {
          const productsResponse = await fetch(`/api/products?category=${category._id}`);
          if (!productsResponse.ok) {
            throw new Error(`Errore nel caricamento dei prodotti per ${category.name}`);
          }
          const productsData = await productsResponse.json();
          productsMap[category._id] = productsData.data;
        }
        
        // Sottocategorie
        for (const subcategory of subCategoriesData.data) {
          const productsResponse = await fetch(`/api/products?category=${subcategory._id}`);
          if (!productsResponse.ok) {
            throw new Error(`Errore nel caricamento dei prodotti per ${subcategory.name}`);
          }
          const productsData = await productsResponse.json();
          productsMap[subcategory._id] = productsData.data;
        }
        
        setProducts(productsMap);
        
        // Imposta la prima sottocategoria come attiva se esiste
        if (subCategoriesData.data.length > 0) {
          setActiveSubcategory(subCategoriesData.data[0]._id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prev, { ...item, quantity: 1 }]
      }
    })
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCartClick = () => {
    setShowCrossSelling(true)
  }

  const handleProceedToSummary = () => {
    onProceedToSummary(cart)
  }

  // Visualizza un indicatore di caricamento
  if (loading) {
    return (
      <div className="w-full max-w-md text-center py-8">
        <p className="text-gray-600">{t.loading}</p>
      </div>
    );
  }

  // Visualizza un messaggio di errore se il caricamento fallisce
  if (error) {
    return (
      <div className="w-full max-w-md text-center py-8">
        <p className="text-red-500">{t.error}</p>
      </div>
    );
  }

  // Render sottocategorie di Light Lunch
  const renderLightLunchSubcategories = () => {
    const lightLunchCategory = mainCategories.find(cat => cat.name === 'lightLunch');
    if (!lightLunchCategory || activeCategory !== lightLunchCategory._id) return null;

    return (
      <div className="mt-4">
        <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {subCategories.map((subcat) => (
              <button
                key={subcat._id}
                onClick={() => setActiveSubcategory(subcat._id)}
                className={`px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeSubcategory === subcat._id ? "bg-amber-500 text-white" : "bg-white text-gray-700"
                }`}
              >
                {subcat.translations[language as keyof typeof subcat.translations]}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-4 space-y-4">
          {products[activeSubcategory]?.map((item) => (
            <div key={item._id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
              <div className="flex-1 pr-4">
                <h3 className="font-medium text-black">
                  {item.translations[language as keyof typeof item.translations]}
                </h3>
                <p className="text-sm text-gray-600">
                  {t.euro} {item.price.toFixed(2)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-amber-100 hover:bg-amber-200 text-black flex-shrink-0"
                onClick={() => addToCart({
                  id: item._id,
                  name: item.translations[language as keyof typeof item.translations],
                  price: item.price
                })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render menu items per categorie non-lightLunch
  const renderMenuItems = () => {
    const lightLunchCategory = mainCategories.find(cat => cat.name === 'lightLunch');
    
    if (lightLunchCategory && activeCategory === lightLunchCategory._id) {
      return renderLightLunchSubcategories();
    }

    return (
      <div className="space-y-4 mt-6">
        {products[activeCategory]?.map((item) => (
          <div key={item._id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
            <div>
              <h3 className="font-medium text-black">
                {item.translations[language as keyof typeof item.translations]}
              </h3>
              <p className="text-sm text-gray-600">
                {t.euro} {item.price.toFixed(2)}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-amber-100 hover:bg-amber-200 text-black"
              onClick={() => addToCart({
                id: item._id,
                name: item.translations[language as keyof typeof item.translations],
                price: item.price
              })}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md pb-20">
      <div className="flex justify-end items-center mb-4">
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-500">{getTotalItems()}</Badge>
          )}
        </div>
      </div>

      {/* Horizontal scrollable category bar */}
      <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
        <div className="flex space-x-4 pb-2">
          {mainCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap ${
                activeCategory === cat._id ? "bg-amber-500 text-white" : "bg-white text-gray-700"
              }`}
            >
              {cat.translations[language as keyof typeof cat.translations]}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <h2 className="text-xl font-playful text-black my-4 uppercase tracking-tight">
        {activeCategory && mainCategories.find(cat => cat._id === activeCategory)?.translations[language as keyof typeof translations]}
      </h2>

      {renderMenuItems()}

      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-full shadow-lg flex items-center justify-center space-x-2 w-full max-w-md"
            onClick={handleCartClick}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span>
              {t.cart} • {t.euro} {getTotalPrice().toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Cross-selling dialog */}
      <CrossSellingDialog
        isOpen={showCrossSelling}
        onClose={() => setShowCrossSelling(false)}
        onProceed={handleProceedToSummary}
        cartItems={cart}
        onAddItem={addToCart}
        language={language}
      />
    </div>
  )
}

