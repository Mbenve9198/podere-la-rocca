import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"

export type Experience = {
  id: string
  titleIt: string
  titleEn: string
  descriptionIt: string
  descriptionEn: string
  image: string
}

export const experiences: Experience[] = [
  {
    id: "pasta-course",
    titleIt: "Corso di pasta fresca",
    titleEn: "Cooking pasta course",
    descriptionIt: "Impara l'arte della pasta fatta in casa con i nostri chef esperti. Un'esperienza autentica toscana.",
    descriptionEn: "Learn the art of homemade pasta with our expert chefs. An authentic Tuscan experience.",
    image: "/images/experiences/pasta-course.png"
  },
  {
    id: "wine-tasting",
    titleIt: "Degustazione dei nostri vini",
    titleEn: "Wine tasting",
    descriptionIt: "Assapora i nostri vini pregiati con una degustazione guidata nei nostri vigneti.",
    descriptionEn: "Savor our fine wines with a guided tasting in our vineyards.",
    image: "/images/experiences/wine-tasting.png"
  },
  {
    id: "cocktail-experience",
    titleIt: "Corso di cocktail",
    titleEn: "Cocktail experience",
    descriptionIt: "Scopri i segreti dei migliori cocktail con i nostri bartender professionisti.",
    descriptionEn: "Discover the secrets of the best cocktails with our professional bartenders.",
    image: "/images/experiences/cocktail-experience.png"
  }
]

interface ExperienceCardProps {
  experience: Experience
  language: string
  variant?: "default" | "compact" | "banner"
  className?: string
  showButton?: boolean
  motionEnabled?: boolean
}

export function ExperienceCard({
  experience,
  language,
  variant = "default",
  className,
  showButton = true,
  motionEnabled = true
}: ExperienceCardProps) {
  const isItalian = language === "it"
  const title = isItalian ? experience.titleIt : experience.titleEn
  const description = isItalian ? experience.descriptionIt : experience.descriptionEn
  
  const translations = {
    it: {
      askReception: "Chiedi alla reception",
      info: "Per info e prenotazioni"
    },
    en: {
      askReception: "Ask at reception",
      info: "For info and bookings"
    }
  }
  
  const t = translations[language as keyof typeof translations]
  
  const Card = motionEnabled ? motion.div : "div"
  
  // Componente banner orizzontale
  if (variant === "banner") {
    return (
      <Card 
        className={cn(
          "w-full flex overflow-hidden rounded-lg bg-amber-50 shadow-md",
          className
        )}
        whileHover={motionEnabled ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-1/3 min-w-20 h-24">
          <Image 
            src={experience.image} 
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-playful text-sm font-medium text-black">{title}</h3>
            <p className="text-xs text-gray-600 line-clamp-1">{t.info}</p>
          </div>
          {showButton && (
            <Button
              size="sm"
              variant="ghost"
              className="self-end mt-1 px-2 py-1 h-7 text-xs text-amber-800 hover:text-amber-900 hover:bg-amber-100"
            >
              {t.askReception}
            </Button>
          )}
        </div>
      </Card>
    )
  }
  
  // Componente compatto
  if (variant === "compact") {
    return (
      <Card 
        className={cn(
          "overflow-hidden rounded-lg bg-white shadow",
          className
        )}
        whileHover={motionEnabled ? { scale: 1.03 } : undefined}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-full h-32">
          <Image 
            src={experience.image} 
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="font-playful text-sm font-medium text-black">{title}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{description}</p>
          
          {showButton && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2 h-8 text-xs text-amber-800 border-amber-300 hover:bg-amber-100"
            >
              {t.askReception}
            </Button>
          )}
        </div>
      </Card>
    )
  }
  
  // Componente default (card completa)
  return (
    <Card 
      className={cn(
        "overflow-hidden rounded-xl bg-white shadow-md",
        className
      )}
      whileHover={motionEnabled ? { scale: 1.03 } : undefined}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-48">
        <Image 
          src={experience.image} 
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-playful text-lg font-medium text-black">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        
        {showButton && (
          <Button
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white"
          >
            {t.askReception}
          </Button>
        )}
      </div>
    </Card>
  )
} 