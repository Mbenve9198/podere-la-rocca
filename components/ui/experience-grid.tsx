import { experiences, ExperienceCard } from "./experience-card"
import { cn } from "@/lib/utils"

interface ExperienceGridProps {
  language: string
  className?: string
  title?: boolean
}

export function ExperienceGrid({
  language,
  className,
  title = true
}: ExperienceGridProps) {
  const translations = {
    it: {
      title: "Esperienze al Podere La Rocca",
      subtitle: "Prenota alla reception"
    },
    en: {
      title: "Experiences at Podere La Rocca",
      subtitle: "Book at reception"
    }
  }
  
  const t = translations[language as keyof typeof translations]
  
  return (
    <div className={cn("w-full space-y-4", className)}>
      {title && (
        <div className="text-center mb-6">
          <h2 className="text-xl font-playful text-black">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            language={language}
            variant="compact"
          />
        ))}
      </div>
    </div>
  )
} 