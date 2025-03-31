import { experiences, ExperienceCard } from "./experience-card"

interface ExperienceBannerProps {
  language: string
  category?: string
  className?: string
  onClickExperience?: (experienceId: string) => void
}

// Mappa per collegare le categorie di menu alle esperienze pertinenti
const categoryToExperienceMap: Record<string, string> = {
  // Categorie principali
  "67e9424db092d6d1d2ff8524": "cocktail-experience", // cocktails -> cocktail-experience
  "67e9424db092d6d1d2ff8525": "wine-tasting", // softDrinks -> wine-tasting
  "67e9424db092d6d1d2ff8526": "wine-tasting", // caffetteria -> wine-tasting
  "67e9424db092d6d1d2ff8527": "pasta-course", // lightLunch -> pasta-course
  
  // Nomi delle categorie
  "cocktails": "cocktail-experience",
  "softDrinks": "wine-tasting",
  "caffetteria": "wine-tasting",
  "lightLunch": "pasta-course"
}

export function ExperienceBanner({
  language,
  category,
  className,
  onClickExperience
}: ExperienceBannerProps) {
  // Se non c'è una categoria, scegliamo un'esperienza casuale
  let experienceId = category && categoryToExperienceMap[category]
    ? categoryToExperienceMap[category]
    : experiences[Math.floor(Math.random() * experiences.length)].id
    
  const experience = experiences.find(exp => exp.id === experienceId) || experiences[0]
  
  return (
    <ExperienceCard
      experience={experience}
      language={language}
      variant="banner"
      className={className}
      onClickExperience={onClickExperience}
    />
  )
} 