import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { experiences, ExperienceCard } from "./experience-card"

interface ExperienceToastProps {
  language: string
  show: boolean
  onClose: () => void
  relatedCategory?: string
  autoDismiss?: boolean
  dismissTime?: number
}

export function ExperienceToast({
  language,
  show,
  onClose,
  relatedCategory,
  autoDismiss = true,
  dismissTime = 7000 // 7 secondi
}: ExperienceToastProps) {
  const [visible, setVisible] = useState(show)
  
  // Selezione dell'esperienza da mostrare
  const getRandomExperience = () => {
    // Se c'è una categoria correlata, cerca un'esperienza correlata
    if (relatedCategory) {
      // Mappa le categorie alle esperienze
      const categoryMap: Record<string, string[]> = {
        "67e9424db092d6d1d2ff8524": ["cocktail-experience"], // cocktails
        "67e9424db092d6d1d2ff8525": ["wine-tasting"], // softDrinks
        "67e9424db092d6d1d2ff8526": ["wine-tasting"], // caffetteria
        "67e9424db092d6d1d2ff8527": ["pasta-course"], // lightLunch
        "cocktails": ["cocktail-experience"],
        "softDrinks": ["wine-tasting"],
        "caffetteria": ["wine-tasting"],
        "lightLunch": ["pasta-course"]
      }
      
      const relatedExperiences = categoryMap[relatedCategory] || []
      
      if (relatedExperiences.length > 0) {
        const randomRelated = relatedExperiences[Math.floor(Math.random() * relatedExperiences.length)]
        return experiences.find(exp => exp.id === randomRelated) || experiences[0]
      }
    }
    
    // Altrimenti, restituisci un'esperienza casuale
    return experiences[Math.floor(Math.random() * experiences.length)]
  }
  
  const [experience] = useState(getRandomExperience())
  
  useEffect(() => {
    setVisible(show)
    
    if (show && autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false)
        onClose()
      }, dismissTime)
      
      return () => clearTimeout(timer)
    }
  }, [show, autoDismiss, dismissTime, onClose])
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 max-w-xs"
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <button
              onClick={() => {
                setVisible(false)
                onClose()
              }}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
            
            <ExperienceCard
              experience={experience}
              language={language}
              variant="compact"
              className="w-72"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 