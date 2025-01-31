import { useState } from "react"

interface ErrorResponse {
  atmID: string
  TnxID: string
  RespType: number
  msg: string
  CrncyType: string
}

export const handleSendTransaction = async (
  transactionKind: number,
  amount = 0,
  CardNumber: number,
  PIN: number,
  setResponse: (response: string) => void,
) => {
  console.log("Initiating transaction...")

  const atmID = "ATM-123"
  const TnxTime = new Date().toISOString()
  const TnxID = `${atmID}-${Date.now()}`

  const transactionData = {
    TnxID,
    TnxTime,
    TnxKind: transactionKind,
    TnxAmount: Number.parseFloat(amount.toString()),
    CardNumber,
    PIN: Number.parseInt(PIN.toString()),
  }

  try {
    const res = await window.electron.sendTransaction(transactionData)
    
    if (typeof res === 'string' && res.includes('Error:')) {
      throw new Error('CONNECTION_ERROR')
    }

    let parsedResponse: ErrorResponse
    try {
      parsedResponse = JSON.parse(res)
    } catch (e) {
      throw new Error('PARSE_ERROR')
    }
    
    let errorMessage
    switch (parsedResponse.RespType) {
      case 0:
        errorMessage = "Transaction approved"
        break
      case 1:
        errorMessage = "Insufficient funds"
        break
      case 2:
        errorMessage = "Incorrect PIN"
        break
      case 3:
        errorMessage = "Card blocked"
        break
      case 4:
        errorMessage = "Card doesn't exist"
        break
      case 5:
        errorMessage = "Card is expired"
        break
      case 6:
        errorMessage = "General/system error"
        break
      default:
        errorMessage = "Unknown error"
    }

    setResponse(errorMessage)
    return parsedResponse
  } catch (err) {
    console.error("Error in handleSendTransaction:", err)
    let errorResponse = { 
      RespType: 6, 
      msg: "Transaction failed",
      atmID: "",
      TnxID: "",
      CrncyType: "0"
    }

    if (err.message === 'CONNECTION_ERROR') {
      errorResponse.msg = "Connection lost. Please try again."
      showErrorPopup(t.errors.systemError, () => window.location.reload());

    } else if (err.message === 'PARSE_ERROR') {
      errorResponse.msg = "System error. Please try again."
    }

    setResponse(errorResponse.msg)
    throw errorResponse // Propagate error to component
  }
}

export const useErrorPopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [callback, setCallback] = useState<(() => void) | null>(null)
  const [shouldReload, setShouldReload] = useState(false)

  const showErrorPopup = (message: string, cb?: () => void) => {
    setPopupMessage(message)
    setShowPopup(true)
    setCallback(() => cb || null)
    // Set reload for all errors except PIN attempts
    setShouldReload(!message.includes("attempts"))
  }

  const closeErrorPopup = () => {
    setShowPopup(false)
    if (callback) {
      callback()
      setCallback(null)
    } else if (shouldReload) {
      window.location.reload()
    }
  }

  return { showPopup, popupMessage, showErrorPopup, closeErrorPopup }
}