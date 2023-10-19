import { useCallback, useContext, useEffect, useState } from "react"
import { AuthMethod } from "@lit-protocol/types"
import Lit from "@/utils/lit"
import { IRelayPKP } from "@lit-protocol/types"
import { useRouter } from "next/navigation"
import { LIT_ACCOUNT } from "@/utils/constants"

export default function useAccount(authMethod?: AuthMethod) {
  const [account, setAccount] = useState<IRelayPKP>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()
  const router = useRouter()

  /**
   * Fetch PKPs tied to given auth method
   */
  const fetchAccount = useCallback(
    async (authMethod: AuthMethod): Promise<void> => {
      setLoading(true)
      setError(undefined)
      try {
        // Fetch PKPs tied to given auth method
        const myPKPs = await Lit.getPKPs(authMethod)
        let newPKP
        if (myPKPs.length > 0) {
          newPKP = myPKPs[0]
        } else {
          newPKP = await Lit.mintPKP(authMethod)
        }
        if (typeof window !== undefined) {
          localStorage.setItem(LIT_ACCOUNT, JSON.stringify(newPKP))
        }
        setAccount(newPKP)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getAccount = () => {
    return typeof window !== "undefined"
      ? localStorage.getItem(LIT_ACCOUNT) &&
          JSON.parse(localStorage.getItem(LIT_ACCOUNT) as string)
      : undefined
  }

  const removeAccount = () => {
    setAccount(undefined)
    localStorage.removeItem(LIT_ACCOUNT)
  }

  useEffect(() => {
    // If user is authenticated, fetch accounts
    if (authMethod) {
      router.replace(window.location.pathname, undefined)
      fetchAccount(authMethod)
    }
  }, [authMethod])

  return {
    fetchAccount,
    setAccount,
    getAccount,
    removeAccount,
    account,
    loading,
    error,
  }
}
