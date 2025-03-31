import React, { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { experiences, Experience } from "./experience-card"

interface ExperienceDialogProps {
  isOpen: boolean
  onClose: () => void
  initialExperienceId?: string
  language: string
}

export function ExperienceDialog({
  isOpen,
  onClose,
  initialExperienceId,
  language
}: ExperienceDialogProps) {
  const [currentExperienceId, setCurrentExperienceId] = useState<string>(
    initialExperienceId || experiences[0].id
  )
  
  // Aggiorna l'esperienza corrente quando cambia initialExperienceId
  useEffect(() => {
    if (initialExperienceId) {
      setCurrentExperienceId(initialExperienceId)
    }
  }, [initialExperienceId])
  
  // Trova l'esperienza corrente
  const currentExperience = experiences.find(exp => exp.id === currentExperienceId) || experiences[0]
  
  // Calcola l'indice corrente
  const currentIndex = experiences.findIndex(exp => exp.id === currentExperienceId)
  
  // Traduzioni
  const translations = {
    it: {
      close: "Chiudi",
      askReception: "Chiedi alla reception per informazioni e prenotazioni",
      otherExperiences: "Altre esperienze",
      prev: "Precedente",
      next: "Successiva"
    },
    en: {
      close: "Close",
      askReception: "Ask at reception for information and bookings",
      otherExperiences: "Other experiences",
      prev: "Previous",
      next: "Next"
    }
  }
  
  const t = translations[language as keyof typeof translations]
  
  // Funzioni per navigare tra le esperienze
  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % experiences.length
    setCurrentExperienceId(experiences[nextIndex].id)
  }
  
  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? experiences.length - 1 : currentIndex - 1
    setCurrentExperienceId(experiences[prevIndex].id)
  }
  
  // Gestisce la chiusura con esc
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    
    window.addEventListener("keydown", handleEscKey)
    
    return () => {
      window.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])
  
  // Previeni lo scrolling del body quando il dialog è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])
  
  // Ottiene titolo e descrizione in base alla lingua
  const isItalian = language === "it"
  const title = isItalian ? currentExperience.titleIt : currentExperience.titleEn
  const description = isItalian ? currentExperience.descriptionIt : currentExperience.descriptionEn
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 touch-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col touch-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {/* Bottone di chiusura */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className="absolute right-2 top-2 z-20 bg-black/50 text-white p-1 rounded-full"
              aria-label={t.close}
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Immagine dell'esperienza */}
            <div className="relative w-full aspect-square">
              <Image
                src={currentExperience.image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
                priority
              />
              
              {/* Controlli di navigazione */}
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 p-2 rounded-full z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  goToPrevious();
                }}
                aria-label={t.prev}
              >
                <ChevronLeft className="h-5 w-5 text-amber-800" />
              </button>
              
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 p-2 rounded-full z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  goToNext();
                }}
                aria-label={t.next}
              >
                <ChevronRight className="h-5 w-5 text-amber-800" />
              </button>
            </div>
            
            {/* Contenuto testuale */}
            <div className="p-4 overflow-y-auto">
              <h2 className="text-xl font-playful text-black mb-2">{title}</h2>
              <p className="text-sm text-gray-600 mb-4">{description}</p>
              
              <p className="text-sm italic text-amber-700 mb-6 text-center">
                {t.askReception}
              </p>
              
              {/* Indicatore di pagina */}
              <div className="flex justify-center gap-1 my-3">
                {experiences.map((exp, idx) => (
                  <button
                    key={exp.id}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex ? "w-6 bg-amber-500" : "w-2 bg-amber-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCurrentExperienceId(exp.id);
                    }}
                    aria-label={`${isItalian ? exp.titleIt : exp.titleEn}`}
                  />
                ))}
              </div>
              
              {/* Altre esperienze */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t.otherExperiences}
                </h3>
                <div className="flex space-x-2 overflow-x-auto pb-2 snap-x">
                  {experiences
                    .filter(exp => exp.id !== currentExperienceId)
                    .map(exp => (
                      <button
                        key={exp.id}
                        className="snap-start flex-shrink-0 w-24 rounded-md overflow-hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCurrentExperienceId(exp.id);
                        }}
                      >
                        <div className="relative w-24 h-24">
                          <Image
                            src={exp.image}
                            alt={isItalian ? exp.titleIt : exp.titleEn}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="text-xs p-1 text-center truncate">
                          {isItalian ? exp.titleIt : exp.titleEn}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 