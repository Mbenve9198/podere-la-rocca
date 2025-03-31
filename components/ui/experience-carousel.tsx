import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { experiences, Experience, ExperienceCard } from "./experience-card"

interface ExperienceCarouselProps {
  language: string
  className?: string
  autoPlay?: boolean
  interval?: number
  onClickExperience?: (experienceId: string) => void
}

export function ExperienceCarousel({
  language,
  className,
  autoPlay = true,
  interval = 5000,
  onClickExperience
}: ExperienceCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === experiences.length - 1 ? 0 : prevIndex + 1
    )
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? experiences.length - 1 : prevIndex - 1
    )
  }, [])

  useEffect(() => {
    if (autoPlay && !isPaused) {
      const timer = setInterval(goToNext, interval)
      return () => clearInterval(timer)
    }
  }, [autoPlay, isPaused, goToNext, interval])

  return (
    <div 
      className={cn(
        "relative overflow-hidden w-full max-w-md rounded-xl shadow-lg bg-white",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {experiences.map((experience) => (
            <div key={experience.id} className="w-full flex-shrink-0">
              <ExperienceCard 
                experience={experience} 
                language={language} 
                className="rounded-none shadow-none"
                motionEnabled={false}
                onClickExperience={onClickExperience}
              />
            </div>
          ))}
        </div>
        
        {/* Controlli di navigazione */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 bottom-10 h-8 w-8 bg-white/80 hover:bg-white rounded-full shadow-md z-10"
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
        >
          <ChevronLeft className="h-4 w-4 text-amber-800" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 bottom-10 h-8 w-8 bg-white/80 hover:bg-white rounded-full shadow-md z-10"
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
        >
          <ChevronRight className="h-4 w-4 text-amber-800" />
        </Button>
      </div>
      
      {/* Indicatori di slide */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
        {experiences.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-6 bg-amber-500" : "w-2 bg-amber-200"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
} 