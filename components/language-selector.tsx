"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type LanguageSelectorProps = {
  currentLanguage: string
  onSelectLanguage: (language: string) => void
  onClose: () => void
}

export default function LanguageSelector({ currentLanguage, onSelectLanguage, onClose }: LanguageSelectorProps) {
  const languages = [
    { code: "it", name: "Italiano" },
    { code: "en", name: "English" },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playful text-center text-xl uppercase tracking-tight text-black">
            {currentLanguage === "it" ? "Seleziona la lingua" : "Select language"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={currentLanguage === language.code ? "default" : "outline"}
              className={
                currentLanguage === language.code ? "bg-amber-500 hover:bg-amber-600 font-playful" : "font-medium"
              }
              onClick={() => onSelectLanguage(language.code)}
            >
              <span className="mr-2 text-lg">{language.code === "it" ? "🇮🇹" : "🇬🇧"}</span>
              {language.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

