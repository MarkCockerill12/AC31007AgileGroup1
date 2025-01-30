import React from "react"
import { motion } from "framer-motion"
import { useTranslation } from "../contexts/TranslationContext"

interface HomeProps {
  onButtonClick: () => void
}

export function Home({ onButtonClick }: HomeProps) {
  const { t, language, setLanguage } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <motion.h1
          className="mainText text-4xl md:text-6xl font-bold mb-4 hover:text-blue-500 hover:dark:text-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.title}
        </motion.h1>
        <motion.h2
          className="text-2xl md:text-3xl mb-8 text-blue-500 dark:text-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t.subtitle}
        </motion.h2>
        <motion.p
          className="text-xl mb-8 max-w-2xl mx-auto text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {t.description}
        </motion.p>
      </div>
      <div className="flex justify-center cursor-pointer">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, }}
          onClick={onButtonClick}
          style={{
            backgroundImage: "url(/assets/enterCard.png)",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "200px",
            height: "150px",
          }}
          whileHover={{ backgroundImage: "url(/assets/enterCardHover.png)" }}
          whileTap={{ backgroundImage: "url(/assets/enterCardOnClick.png)" }}
        ></motion.div>
      </div>
      <div className="fixed bottom-0 right-0 mb-4 mr-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 bg-white text-black rounded"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
          <option value="ru">Русский</option>
          <option value="ar">العربية</option>
        </select>
      </div>
    </div>
  )
}

