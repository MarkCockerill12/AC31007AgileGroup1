import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import translations from "../translations.json"

interface TranslationContextType {
  t: (typeof translations)["en"]
  language: string
  setLanguage: React.Dispatch<React.SetStateAction<string>>
}

const TranslationContext = createContext<TranslationContextType>({
  t: translations["en"],
  language: "en",
  setLanguage: () => {},
})

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("language") || "en"
    }
    return "en"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language)
    }
  }, [language])

  const t = translations[language]

  return <TranslationContext.Provider value={{ t, language, setLanguage }}>{children}</TranslationContext.Provider>
}

export const useTranslation = () => useContext(TranslationContext)

