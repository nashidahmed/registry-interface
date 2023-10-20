import { SISMO_RES } from "@/utils/constants"
import { useState } from "react"

export default function useSismo(response?: string) {
  const [responseBytes, setResponseBytes] = useState<string>(
    typeof window !== "undefined"
      ? (localStorage.getItem(SISMO_RES) as string)
      : (response as string)
  )

  const setResponse = (res: string) => {
    if (typeof window !== undefined) {
      localStorage.setItem(SISMO_RES, res)
    }
    setResponseBytes(res)
  }

  const getRes = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SISMO_RES)
    }
  }

  const removeRes = () => {
    setResponseBytes("")
    localStorage.removeItem(SISMO_RES)
  }

  return {
    responseBytes,
    setResponse,
    getRes,
    removeRes,
  }
}
