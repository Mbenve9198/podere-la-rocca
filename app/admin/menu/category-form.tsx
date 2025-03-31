"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { ICategory } from "./types"

type CategoryFormProps = {
  category: ICategory | null
  onSave: (category: ICategory) => void
  onCancel: () => void
  isNew: boolean
}

export default function CategoryForm({ category, onSave, onCancel, isNew }: CategoryFormProps) {
  const [formData, setFormData] = useState<ICategory>(
    category || {
      _id: "",
      name: "",
      translations: { it: "", en: "" },
      order: 0,
    },
  )

  const [errors, setErrors] = useState({
    name: "",
    translationIt: "",
    translationEn: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "translationIt" || name === "translationEn") {
      setFormData({
        ...formData,
        translations: {
          ...formData.translations,
          [name === "translationIt" ? "it" : "en"]: value,
        },
      })
    } else if (name === "order") {
      setFormData({
        ...formData,
        order: Number.parseInt(value) || 0,
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
      translationIt: "",
      translationEn: "",
    }

    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio"
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
      // If it's a new category and no name is provided, generate one from the Italian translation
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
        <h1 className="text-xl font-playful text-black">{isNew ? "Nuova Categoria" : "Modifica Categoria"}</h1>
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
                placeholder="es. cocktails (opzionale per nuove categorie)"
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
                placeholder="es. Cocktails"
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
                placeholder="es. Cocktails"
                className={`w-full p-3 border ${errors.translationEn ? "border-red-300" : "border-gray-300"} rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              />
              {errors.translationEn && <p className="mt-1 text-sm text-red-600">{errors.translationEn}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordine</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Determina l'ordine di visualizzazione (numeri più bassi vengono mostrati prima)
              </p>
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

