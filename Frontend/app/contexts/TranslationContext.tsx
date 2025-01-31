import { createContext, useState, useContext, useEffect } from "react"
import translations from "../translations.json"

interface TranslationContextType {
  t: (typeof translations)["en"]
  language: string
  setLanguage: (lang: string) => void
}

const TranslationContext = createContext<TranslationContextType>({
  t: translations["en"],
  language: "en",
  setLanguage: () => {},
})

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  // Set initial state without window check
  const [language, setLanguage] = useState<string>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Set mounted state after initial render
    setMounted(true)
    // Load saved language preference
    const savedLang = localStorage.getItem("language")
    if (savedLang && Object.keys(translations).includes(savedLang)) {
      setLanguage(savedLang)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("language", language)
    }
  }, [language, mounted])

  // Only render content after mounted to avoid hydration mismatch
  if (!mounted) {
    return null // or loading state
  }

  return (
    <TranslationContext.Provider 
      value={{ 
        t: translations[language as keyof typeof translations], 
        language, 
        setLanguage 
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => useContext(TranslationContext)