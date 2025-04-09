"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { IProduct, ICategory } from "./types"

type ProductFormProps = {
  product: IProduct | null
  categories: ICategory[]
  onSave: (product: IProduct) => void
  onCancel: () => void
  isNew: boolean
}

export default function ProductForm({ product, categories, onSave, onCancel, isNew }: ProductFormProps) {
  const [formData, setFormData] = useState<IProduct>(
    product || {
      _id: "",
      name: "",
      price: 0,
      category: categories.length > 0 ? categories[0]._id : "",
      available: true,
      pickup_required: false,
      translations: {
        it: "",
        en: "",
        description: {
          it: "",
          en: "",
        },
      },
    },
  )

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    category: "",
    translationIt: "",
    translationEn: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (name === "translationIt" || name === "translationEn") {
      setFormData({
        ...formData,
        translations: {
          ...formData.translations,
          [name === "translationIt" ? "it" : "en"]: value,
        },
      })
    } else if (name === "descriptionIt" || name === "descriptionEn") {
      setFormData({
        ...formData,
        translations: {
          ...formData.translations,
          description: {
            ...formData.translations.description,
            [name === "descriptionIt" ? "it" : "en"]: value,
          },
        },
      })
    } else if (name === "price") {
      setFormData({
        ...formData,
        price: Number.parseFloat(value) || 0,
      })
    } else if (name === "available") {
      setFormData({
        ...formData,
        available: (e.target as HTMLInputElement).checked,
      })
    } else if (name === "pickup_required") {
      setFormData({
        ...formData,
        pickup_required: (e.target as HTMLInputElement).checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      price: "",
      category: "",
      translationIt: "",
      translationEn: "",
    }

    let isValid = true

    if (!formData.name.trim() && !isNew) {
      newErrors.name = "Il nome è obbligatorio"
      isValid = false
    }

    if (formData.price <= 0) {
      newErrors.price = "Il prezzo deve essere maggiore di zero"
      isValid = false
    }

    if (!formData.category) {
      newErrors.category = "La categoria è obbligatoria"
      isValid = false
    }

    if (!formData.translations.it.trim()) {
      newErrors.translationIt = "La traduzione italiana è obbligatoria"
      isValid = false
    }

    if (!formData.translations.en.trim()) {
      newErrors.translationEn = "La traduzione inglese è obbligatoria"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // If it's a new product and no name is provided, generate one from the Italian translation
      if (isNew && !formData.name.trim()) {
        const generatedName = formData.translations.it
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")

        onSave({
          ...formData,
          name: generatedName,
        })
      } else {
        onSave(formData)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" className="mr-2 text-gray-700" onClick={onCancel}>
          <span className="text-lg">⬅️</span>
        </Button>
        <h1 className="text-xl font-playful text-black">{isNew ? "Nuovo Prodotto" : "Modifica Prodotto"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          className="bg-white rounded-lg shadow p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Tecnico</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="es. aperol-spritz (opzionale per nuovi prodotti)"
                className={`w-full p-3 border ${errors.name ? "border-red-300" : "border-gray-300"} rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              {isNew && (
                <p className="mt-1 text-xs text-gray-500">
                  Se non specificato, verrà generato automaticamente dalla traduzione italiana
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Italiano</label>
              <input
                type="text"
                name="translationIt"
                value={formData.translations.it}
                onChange={handleChange}
                placeholder="es. Aperol Spritz"
                className={`w-full p-3 border ${errors.translationIt ? "border-red-300" : "border-gray-300"} rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              />
              {errors.translationIt && <p className="mt-1 text-sm text-red-600">{errors.translationIt}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Inglese</label>
              <input
                type="text"
                name="translationEn"
                value={formData.translations.en}
                onChange={handleChange}
                placeholder="es. Aperol Spritz"
                className={`w-full p-3 border ${errors.translationEn ? "border-red-300" : "border-gray-300"} rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              />
              {errors.translationEn && <p className="mt-1 text-sm text-red-600">{errors.translationEn}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={`w-full p-3 border ${errors.price ? "border-red-300" : "border-gray-300"} rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.category ? "border-red-300" : "border-gray-300"} rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.translations.it}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Italiana (opzionale)</label>
              <textarea
                name="descriptionIt"
                value={formData.translations.description?.it || ""}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Inglese (opzionale)</label>
              <textarea
                name="descriptionEn"
                value={formData.translations.description?.en || ""}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                Disponibile
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="pickup_required"
                name="pickup_required"
                checked={formData.pickup_required}
                onChange={handleChange}
                className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="pickup_required" className="ml-2 block text-sm text-gray-700">
                Richiede ritiro in loco
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Immagine (opzionale)</label>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
                <div className="space-y-1 text-center">
                  <span className="mx-auto h-12 w-12 text-gray-400 text-4xl">🖼️</span>
                  <div className="text-sm text-gray-600">
                    <p>Funzionalità non disponibile in questa versione</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex space-x-3">
          <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
            <span className="text-lg mr-2">💾</span>
            Salva
          </Button>
          <Button type="button" variant="outline" className="flex-1 border-gray-300" onClick={onCancel}>
            Annulla
          </Button>
        </div>
      </form>
    </div>
  )
}

