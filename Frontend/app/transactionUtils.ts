import { useState } from "react"

interface ErrorResponse {
  atmID: string
  TnxID: string
  RespType: number
  msg: string
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
    TnxAmount: Number.parseFloat(amount.toString()), // Ensure amount is a number
    CardNumber,
    PIN: Number.parseInt(PIN.toString()), // Ensure PIN is an integer
  }

  try {
    const res = await window.electron.sendTransaction(transactionData)
    const parsedResponse: ErrorResponse = JSON.parse(res)

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
    setResponse("Transaction failed")
    return { RespType: 6, msg: "Transaction failed" }
  }
}

export const handleBalanceRequest = async (
  CardNumber: number,
  setBalance: (balance: number) => void,
  setResponse: (response: string) => void,
) => {
  console.log("Requesting balance...")

  const atmID = "ATM-123"
  const TnxTime = new Date().toISOString()
  const TnxID = `${atmID}-${Date.now()}`

  const transactionData = {
    TnxID,
    TnxTime,
    TnxKind: 0,
    TnxAmount: 0,
    CardNumber,
    PIN: 0,
  }

  try {
    console.log("Sending balance request data:", transactionData)
    const res = await window.electron.sendTransaction(transactionData)
    console.log("Received response:", res)
    const parsedResponse: ErrorResponse = JSON.parse(res)

    if (parsedResponse.RespType === 0) {
      setBalance(Number.parseFloat(parsedResponse.msg))
    } else {
      setResponse(parsedResponse.msg)
    }
  } catch (err) {
    console.error("Error in handleBalanceRequest:", err)
    setResponse("Balance request failed: " + err.message)
  }
}

export const useErrorPopup = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")
  const [callback, setCallback] = useState<(() => void) | null>(null)

  const showErrorPopup = (message: string, cb?: () => void) => {
    setPopupMessage(message)
    setCallback(() => cb || null)
    setShowPopup(true)
  }

  const closeErrorPopup = () => {
    setShowPopup(false)
    if (callback) {
      callback()
    }
    setCallback(null)
  }

  return { showPopup, popupMessage, showErrorPopup, closeErrorPopup }
}