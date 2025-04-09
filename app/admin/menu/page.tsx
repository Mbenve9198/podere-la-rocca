"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ICategory, IProduct } from "./types"
import CategoryForm from "./category-form"
import ProductForm from "./product-form"
import { toast } from "react-hot-toast"
import LightLunchSettings from "./light-lunch-settings"

type View = "categories" | "products" | "editCategory" | "newCategory" | "editProduct" | "newProduct"

export default function MenuManagement() {
  const router = useRouter()
  const [view, setView] = useState<View>("categories")
  const [categories, setCategories] = useState<ICategory[]>([])
  const [products, setProducts] = useState<IProduct[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Carica le categorie dal database
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      } else {
        console.error("Errore nel recupero delle categorie:", result)
        toast.error("Errore nel caricamento delle categorie")
      }
    } catch (error) {
      console.error("Errore nella richiesta delle categorie:", error)
      toast.error("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  // Carica i prodotti dal database
  const fetchProducts = async (categoryId?: string) => {
    try {
      const url = categoryId 
        ? `/api/products?category=${categoryId}`
        : '/api/products'
        
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setProducts(result.data)
      } else {
        console.error("Errore nel recupero dei prodotti:", result)
        toast.error("Errore nel caricamento dei prodotti")
      }
    } catch (error) {
      console.error("Errore nella richiesta dei prodotti:", error)
      toast.error("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  // Carica i dati all'avvio
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  // Ricarica i prodotti quando cambia il filtro di categoria
  useEffect(() => {
    if (filterCategory) {
      fetchProducts(filterCategory)
    } else {
      fetchProducts()
    }
  }, [filterCategory])

  // Crea o aggiorna una categoria
  const saveCategory = async (category: ICategory) => {
    try {
      setLoading(true)
      const isNew = !category._id
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/categories' : `/api/categories/${category._id}`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(isNew ? "Categoria creata con successo" : "Categoria aggiornata con successo")
        fetchCategories()
        setView("categories")
      } else {
        console.error("Errore nel salvataggio della categoria:", result)
        toast.error(result.message || "Errore nel salvataggio della categoria")
      }
    } catch (error) {
      console.error("Errore nella richiesta di salvataggio categoria:", error)
      toast.error("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  // Crea o aggiorna un prodotto
  const saveProduct = async (product: IProduct) => {
    try {
      setLoading(true)
      const isNew = !product._id
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/products' : `/api/products/${product._id}`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(isNew ? "Prodotto creato con successo" : "Prodotto aggiornato con successo")
        fetchProducts(filterCategory || undefined)
        setView("products")
      } else {
        console.error("Errore nel salvataggio del prodotto:", result)
        toast.error(result.message || "Errore nel salvataggio del prodotto")
      }
    } catch (error) {
      console.error("Errore nella richiesta di salvataggio prodotto:", error)
      toast.error("Errore di connessione al server")
    } finally {
      setLoading(false)
    }
  }

  // Elimina una categoria
  const deleteCategory = async (categoryId: string) => {
    if (confirm("Sei sicuro di voler eliminare questa categoria? Questa azione non può essere annullata.")) {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.success) {
          toast.success("Categoria eliminata con successo")
          fetchCategories()
        } else {
          console.error("Errore nell'eliminazione della categoria:", result)
          toast.error(result.message || "Errore nell'eliminazione della categoria")
        }
      } catch (error) {
        console.error("Errore nella richiesta di eliminazione categoria:", error)
        toast.error("Errore di connessione al server")
      } finally {
        setLoading(false)
      }
    }
  }

  // Elimina un prodotto
  const deleteProduct = async (productId: string) => {
    if (confirm("Sei sicuro di voler eliminare questo prodotto? Questa azione non può essere annullata.")) {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.success) {
          toast.success("Prodotto eliminato con successo")
          fetchProducts(filterCategory || undefined)
        } else {
          console.error("Errore nell'eliminazione del prodotto:", result)
          toast.error(result.message || "Errore nell'eliminazione del prodotto")
        }
      } catch (error) {
        console.error("Errore nella richiesta di eliminazione prodotto:", error)
        toast.error("Errore di connessione al server")
      } finally {
        setLoading(false)
      }
    }
  }

  // Aggiorna disponibilità del prodotto
  const toggleProductAvailability = async (productId: string, currentAvailability: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          available: !currentAvailability
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Aggiorna localmente lo stato
        setProducts(products.map(p => 
          p._id === productId ? { ...p, available: !p.available } : p
        ))
        
        toast.success(`Prodotto ${!currentAvailability ? 'disponibile' : 'non disponibile'}`)
      } else {
        console.error("Errore nell'aggiornamento della disponibilità:", result)
        toast.error(result.message || "Errore nell'aggiornamento della disponibilità")
      }
    } catch (error) {
      console.error("Errore nella richiesta di aggiornamento disponibilità:", error)
      toast.error("Errore di connessione al server")
    }
  }

  // Handle category selection for editing
  const handleEditCategory = (category: ICategory) => {
    setSelectedCategory(category)
    setView("editCategory")
  }

  // Handle product selection for editing
  const handleEditProduct = (product: IProduct) => {
    setSelectedProduct(product)
    setView("editProduct")
  }

  // Handle category creation/update
  const handleSaveCategory = (category: ICategory) => {
    saveCategory(category)
  }

  // Handle product creation/update
  const handleSaveProduct = (product: IProduct) => {
    saveProduct(product)
  }

  // Handle product availability toggle
  const handleToggleAvailability = (productId: string, currentAvailability: boolean) => {
    toggleProductAvailability(productId, currentAvailability)
  }

  // Filter products based on search term and category filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.translations.it.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.translations.en.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat._id === categoryId)
    return category ? category.translations.it : "Categoria sconosciuta"
  }

  // Render categories view
  const renderCategoriesView = () => (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-4">
        <Button
          onClick={() => {
            setSelectedCategory(null)
            setView("newCategory")
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          <span className="text-lg mr-1">➕</span>
          Nuova
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nessuna categoria trovata</div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium text-black">{category.translations.it}</h3>
                <p className="text-sm text-gray-500">{category.translations.en}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-amber-500"
                  onClick={() => handleEditCategory(category)}
                >
                  <span className="text-lg">✏️</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => deleteCategory(category._id)}
                >
                  <span className="text-lg">🗑️</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  // Render products view
  const renderProductsView = () => (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-4">
        <Button
          onClick={() => {
            setSelectedProduct(null)
            setView("newProduct")
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          <span className="text-lg mr-1">➕</span>
          Nuovo
        </Button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Cerca prodotti..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
      </div>

      <div
        className="mb-4 overflow-x-auto flex space-x-2 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Button
          variant={filterCategory === null ? "default" : "outline"}
          className={`whitespace-nowrap ${filterCategory === null ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
          size="sm"
          onClick={() => setFilterCategory(null)}
        >
          Tutte
        </Button>
        {categories.map((category) => (
          <Button
            key={category._id}
            variant={filterCategory === category._id ? "default" : "outline"}
            className={`whitespace-nowrap ${filterCategory === category._id ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
            size="sm"
            onClick={() => setFilterCategory(category._id)}
          >
            {category.translations.it}
          </Button>
        ))}
      </div>

      {/* Light Lunch Settings */}
      {selectedCategory?.name === "lightLunch" && (
        <div className="mt-8">
          <LightLunchSettings categoryId={selectedCategory._id} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nessun prodotto trovato</div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-black">{product.translations.it}</h3>
                  <p className="text-sm text-gray-500">{product.translations.en}</p>
                  {product.translations.description && (
                    <p className="text-xs text-gray-500 mt-1">{product.translations.description.it}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-amber-500 mr-1"
                    onClick={() => handleEditProduct(product)}
                  >
                    <span className="text-lg">✏️</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500 mr-1"
                    onClick={() => deleteProduct(product._id)}
                  >
                    <span className="text-lg">🗑️</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={product.available ? "text-green-500" : "text-gray-400"}
                    onClick={() => handleToggleAvailability(product._id, product.available)}
                  >
                    {product.available ? <span className="text-xl">🟢</span> : <span className="text-xl">⚪</span>}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{getCategoryName(product.category)}</span>
                <span className="font-bold text-amber-600">€{product.price.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  // Replace the return statement with this updated version that includes tabs
  return (
    <div className="flex flex-col min-h-screen bg-amber-50 pb-16">
      {/* Large tabs for view switching */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={view === "categories" ? "default" : "outline"}
            className={`h-14 text-lg ${view === "categories" ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
            onClick={() => setView("categories")}
          >
            Categorie
          </Button>
          <Button
            variant={view === "products" ? "default" : "outline"}
            className={`h-14 text-lg ${view === "products" ? "bg-amber-500 hover:bg-amber-600" : "border-amber-300 text-amber-700"}`}
            onClick={() => setView("products")}
          >
            Prodotti
          </Button>
        </div>
      </div>

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {view === "categories" && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderCategoriesView()}
            </motion.div>
          )}

          {view === "products" && (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderProductsView()}
            </motion.div>
          )}

          {(view === "editCategory" || view === "newCategory") && (
            <motion.div key="categoryForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CategoryForm
                category={selectedCategory}
                onSave={handleSaveCategory}
                onCancel={() => setView("categories")}
                isNew={view === "newCategory"}
              />
            </motion.div>
          )}

          {(view === "editProduct" || view === "newProduct") && (
            <motion.div key="productForm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProductForm
                product={selectedProduct}
                categories={categories}
                onSave={handleSaveProduct}
                onCancel={() => setView("products")}
                isNew={view === "newProduct"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-3 h-16">
          <button
            className="flex flex-col items-center justify-center text-gray-600"
            onClick={() => router.push("/admin")}
          >
            <span className="text-xl">📋</span>
            <span className="text-xs mt-1">Ordini</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-amber-50 text-amber-600 border-t-2 border-amber-500">
            <span className="text-xl">🍽️</span>
            <span className="text-xs mt-1 font-medium">Modifica menu</span>
          </button>
          <button
            className="flex flex-col items-center justify-center text-gray-600"
            onClick={() => router.push("/admin/analytics")}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  )
}

