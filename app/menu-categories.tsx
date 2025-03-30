"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

type MenuCategoriesProps = {
  language: string
  onSelectCategory: (category: string) => void
}

export default function MenuCategories({ language, onSelectCategory }: MenuCategoriesProps) {
  const router = useRouter()

  const translations = {
    it: {
      cocktails: "COCKTAILS",
      softDrinks: "SOFT DRINKS",
      caffetteria: "CAFFETTERIA",
      lightLunch: "LIGHT LUNCH",
      back: "Indietro",
    },
    en: {
      cocktails: "COCKTAILS",
      softDrinks: "SOFT DRINKS",
      caffetteria: "COFFEE BAR",
      lightLunch: "LIGHT LUNCH",
      back: "Back",
    },
  }

  const t = translations[language as keyof typeof translations]

  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3,
            ease: "easeInOut",
          }}
          onClick={() => onSelectCategory("cocktails")}
          className="relative flex flex-col items-center"
        >
          <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/images/cocktail.png" alt="Cocktails" width={90} height={90} className="object-contain" />
          </div>
          <span className="mt-2 text-base font-playful text-black uppercase tracking-tight">{t.cocktails}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3.5,
            ease: "easeInOut",
            delay: 0.5,
          }}
          onClick={() => onSelectCategory("softDrinks")}
          className="relative flex flex-col items-center"
        >
          <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/images/juice.png" alt="Soft Drinks" width={90} height={90} className="object-contain" />
          </div>
          <span className="mt-2 text-base font-playful text-black uppercase tracking-tight">{t.softDrinks}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 4,
            ease: "easeInOut",
            delay: 0.75,
          }}
          onClick={() => onSelectCategory("caffetteria")}
          className="relative flex flex-col items-center"
        >
          <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/images/caffe.png" alt="Caffetteria" width={90} height={90} className="object-contain" />
          </div>
          <span className="mt-2 text-base font-playful text-black uppercase tracking-tight">{t.caffetteria}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3.8,
            ease: "easeInOut",
            delay: 1,
          }}
          onClick={() => onSelectCategory("lightLunch")}
          className="relative flex flex-col items-center"
        >
          <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/images/light-lunch.png" alt="Light Lunch" width={90} height={90} className="object-contain" />
          </div>
          <span className="mt-2 text-base font-playful text-black uppercase tracking-tight">{t.lightLunch}</span>
        </motion.button>
      </div>
    </div>
  )
}

