import { motion } from "framer-motion"
import { useTranslation } from "../contexts/TranslationContext"

interface LoginButtonsProps {
  setCardNumber: (CardNumber: string) => void
  setPIN: (PIN: string) => void
  setShowSummary: (show: boolean) => void
}

export function LoginButtons({ setCardNumber, setPIN, setShowSummary }: LoginButtonsProps) {
  const { t } = useTranslation()
  const accounts = [
    { CardNumber: "4242424242424242", PIN: "1234" },
    { CardNumber: "987654321", PIN: "4321" },
    { CardNumber: "456789123", PIN: "5678" },
    { CardNumber: "789123456", PIN: "8765" },
  ]

  const handleLogin = (account) => {
    setCardNumber(account.CardNumber)
    setPIN(account.PIN)
    setShowSummary(true)
  }

  const buttonColors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"]

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h2 className="text-white text-4xl mb-12 font-extrabold">{t.selectAccount}</h2>
      <div className="flex space-x-4 ">
        {accounts.map((account, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center cursor-pointer "
            onClick={() => handleLogin(account)}
          >
          <div className="relative group flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              style={{
                backgroundImage: "url(/assets/enterCard.png)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "200px",
                height: "150px",
                border: `4px solid ${buttonColors[index].replace("bg-", "")}`,
              }}
              whileHover={{ backgroundImage: "url(/assets/enterCardHover.png)" }}
              whileTap={{ backgroundImage: "url(/assets/enterCardOnClick.png)" }}
            >
            </motion.div>
            <div className="text-white font-bold m-2 p-2 mt-2 duration-200 group-hover:scale-125">
              {t.account} {index + 1}
            </div>
          </div>
            

          </div>
        ))}
      </div>
      <div className=" mt-4 ml-4 flex items-center duration-200 hover:scale-125">
        <img src="/assets/backButton.png" alt="Back Icon" className="w-6 h-6 cursor-pointer" onClick={() => window.location.reload()} />
        <motion.button
          className="px-4 py-2 text-white font-bold rounded transition-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onClick={() => window.location.reload()}
        >
          {t.goBack}
        </motion.button>
      </div>
      <div className="fixed top-0 right-0 mt-4 mr-4 text-white mainText text-4xl font-bold mb-4">NCR</div>
    </div>
  )
}