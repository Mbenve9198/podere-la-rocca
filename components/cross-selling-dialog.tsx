"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type CrossSellingDialogProps = {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  cartItems: { id: string; name: string; price: number; quantity: number }[]
  onAddItem: (item: { id: string; name: string; price: number }) => void
  language: string
}

export default function CrossSellingDialog({
  isOpen,
  onClose,
  onProceed,
  cartItems,
  onAddItem,
  language,
}: CrossSellingDialogProps) {
  const translations = {
    it: {
      title: "Completa il tuo ordine",
      suggestion: "Ti potrebbe interessare anche",
      proceed: "Vai al riepilogo",
      euro: "Euro",
    },
    en: {
      title: "Complete your order",
      suggestion: "You might also like",
      proceed: "Go to summary",
      euro: "Euro",
    },
  }

  const t = translations[language as keyof typeof translations]

  // Function to get suggested items based on cart contents
  const getSuggestedItems = () => {
    const suggestions: { id: string; name: string; price: number }[] = []
    const cartItemIds = cartItems.map((item) => item.id)

    // Check if there are cocktails in the cart
    const hasAlcohol = cartItems.some((item) => ["aperol", "hugo", "gin-tonic", "americano"].includes(item.id))

    // Check if there are food items in the cart
    const hasFood = cartItems.some(
      (item) =>
        item.id.includes("insalat") ||
        item.id.includes("piadina") ||
        item.id.includes("caprese") ||
        item.id.includes("spaghetto") ||
        item.id.includes("tagliatelle") ||
        item.id.includes("ravioli") ||
        item.id.includes("tagliata") ||
        item.id.includes("petto-pollo") ||
        item.id.includes("carpaccio"),
    )

    // If there are cocktails but no water, suggest water
    if (hasAlcohol && !cartItemIds.includes("acqua")) {
      suggestions.push({ id: "acqua", name: "Acqua naturale/frizzante 500ml", price: 1.5 })
    }

    // If there are food items but no drinks, suggest drinks
    if (
      hasFood &&
      !cartItems.some((item) =>
        ["aranciata", "coca-cola", "succo-arancia", "the-limone", "birra", "acqua"].includes(item.id),
      )
    ) {
      suggestions.push({ id: "acqua", name: "Acqua naturale/frizzante 500ml", price: 1.5 })
      suggestions.push({ id: "coca-cola", name: "Coca Cola", price: 3 })
    }

    // If there's food but no side dishes
    if (hasFood && !cartItems.some((item) => ["insalata-mista", "patatine"].includes(item.id))) {
      suggestions.push({ id: "patatine", name: "Patatine fritte", price: 4 })
      suggestions.push({ id: "insalata-mista", name: "Insalata mista (pomodorini e lattuga)", price: 4 })
    }

    // If there's a main course but no dessert
    if (
      cartItems.some(
        (item) =>
          item.id.includes("tagliata") ||
          item.id.includes("petto-pollo") ||
          item.id.includes("carpaccio") ||
          item.id.includes("piadina"),
      ) &&
      !cartItemIds.includes("frutta-stagione")
    ) {
      suggestions.push({ id: "frutta-stagione", name: "Frutta fresca di stagione", price: 5 })
    }

    // If there's coffee but no dessert
    if (
      cartItems.some((item) => ["caffe", "cappuccino", "the"].includes(item.id)) &&
      !cartItemIds.includes("frutta-stagione")
    ) {
      suggestions.push({ id: "frutta-stagione", name: "Frutta fresca di stagione", price: 5 })
    }

    // Return up to 3 suggestions, excluding items already in cart
    return suggestions.filter((item) => !cartItemIds.includes(item.id)).slice(0, 3)
  }

  const suggestedItems = getSuggestedItems()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-playful text-black">{t.title}</DialogTitle>
        </DialogHeader>

        {suggestedItems.length > 0 ? (
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-3">{t.suggestion}:</p>
            <div className="space-y-3">
              {suggestedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
                >
                  <div>
                    <h3 className="font-medium text-black">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {t.euro} {item.price.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-amber-100 hover:bg-amber-200 text-black"
                    onClick={() => onAddItem(item)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">Il tuo ordine è completo!</div>
        )}

        <DialogFooter>
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={onProceed}>
            {t.proceed}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

