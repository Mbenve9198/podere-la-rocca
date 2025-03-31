"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ICategory, IProduct } from "./types"
import CategoryForm from "./category-form"
import ProductForm from "./product-form"

// Mock data for categories
const mockCategories: ICategory[] = [
  {
    _id: "cat-001",
    name: "cocktails",
    translations: { it: "Cocktails", en: "Cocktails" },
    order: 1,
  },
  {
    _id: "cat-002",
    name: "softDrinks",
    translations: { it: "Bevande & Soft Drinks", en: "Drinks & Soft Drinks" },
    order: 2,
  },
  {
    _id: "cat-003",
    name: "caffetteria",
    translations: { it: "Caffetteria", en: "Coffee Bar" },
    order: 3,
  },
  {
    _id: "cat-004",
    name: "lightLunch",
    translations: { it: "Light Lunch", en: "Light Lunch" },
    order: 4,
  },
]

// Mock data for products
const mockProducts: IProduct[] = [
  {
    _id: "prod-001",
    name: "aperol",
    price: 7,
    category: "cat-001",
    available: true,
    translations: {
      it: "Aperol Spritz",
      en: "Aperol Spritz",
      description: {
        it: "Aperol, Prosecco, Soda",
        en: "Aperol, Prosecco, Soda",
      },
    },
  },
  {
    _id: "prod-002",
    name: "hugo",
    price: 7,
    category: "cat-001",
    available: true,
    translations: {
      it: "Hugo",
      en: "Hugo",
      description: {
        it: "Prosecco, Sciroppo di Sambuco, Menta, Lime",
        en: "Prosecco, Elderflower Syrup, Mint, Lime",
      },
    },
  },
  {
    _id: "prod-003",
    name: "coca-cola",
    price: 3,
    category: "cat-002",
    available: true,
    translations: { it: "Coca Cola", en: "Coca Cola" },
  },
  {
    _id: "prod-004",
    name: "caffe",
    price: 2,
    category: "cat-003",
    available: true,
    translations: { it: "Caffè", en: "Espresso" },
  },
  {
    _id: "prod-005",
    name: "cappuccino",
    price: 3,
    category: "cat-003",
    available: true,
    translations: { it: "Cappuccino", en: "Cappuccino" },
  },
  {
    _id: "prod-006",
    name: "insalatona-tonno",
    price: 12,
    category: "cat-004",
    subcategory: "antipasti",
    available: true,
    translations: {
      it: "Insalatona con tonno, pomodorini, lattuga e olive",
      en: "Salad with tuna, cherry tomatoes, lettuce and olives",
    },
  },
]

type View = "categories" | "products" | "editCategory" | "newCategory" | "editProduct" | "newProduct"

export default function MenuManagement() {
  const router = useRouter()
  const [view, setView] = useState<View>("categories")
  const [categories, setCategories] = useState<ICategory[]>(mockCategories)
  const [products, setProducts] = useState<IProduct[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  // Filter products based on search term and category filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.translations.it.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.translations.en.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory ? product.category === filterCategory : true

    return matchesSearch && matchesCategory
  })

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
    if (view === "editCategory" && selectedCategory) {
      // Update existing category
      setCategories((prev) => prev.map((cat) => (cat._id === category._id ? category : cat)))
    } else {
      // Add new category
      const newCategory = {
        ...category,
        _id: `cat-${Date.now()}`, // Generate a temporary ID
      }
      setCategories((prev) => [...prev, newCategory])
    }
    setView("categories")
  }

  // Handle product creation/update
  const handleSaveProduct = (product: IProduct) => {
    if (view === "editProduct" && selectedProduct) {
      // Update existing product
      setProducts((prev) => prev.map((prod) => (prod._id === product._id ? product : prod)))
    } else {
      // Add new product
      const newProduct = {
        ...product,
        _id: `prod-${Date.now()}`, // Generate a temporary ID
      }
      setProducts((prev) => [...prev, newProduct])
    }
    setView("products")
  }

  // Handle product availability toggle
  const handleToggleAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((product) => (product._id === productId ? { ...product, available: !product.available } : product)),
    )
  }

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
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-amber-500"
              onClick={() => handleEditCategory(category)}
            >
              <span className="text-lg">✏️</span>
            </Button>
          </motion.div>
        ))}
      </div>
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

      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nessun prodotto trovato</div>
        ) : (
          filteredProducts.map((product) => (
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
                    className={product.available ? "text-green-500" : "text-gray-400"}
                    onClick={() => handleToggleAvailability(product._id)}
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
          ))
        )}
      </div>
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

