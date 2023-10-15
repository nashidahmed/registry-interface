import { useCallback, useState } from "react"
import { AuthMethod } from "@lit-protocol/types"
import { getPKPs, mintPKP } from "@/utils/lit"
import { IRelayPKP } from "@lit-protocol/types"

export default function useAccounts() {
  const [currentAccount, setCurrentAccount] = useState<IRelayPKP>(
    sessionStorage.getItem("account")
      ? JSON.parse(sessionStorage.getItem("account") as string)
      : null
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()

  /**
   * Fetch PKPs tied to given auth method
   */
  const fetchAccount = useCallback(
    async (authMethod: AuthMethod): Promise<void> => {
      setLoading(true)
      setError(undefined)
      try {
        // Fetch PKPs tied to given auth method
        const myPKPs = await getPKPs(authMethod)
        sessionStorage.setItem("account", JSON.stringify(myPKPs[0]))
        setCurrentAccount(myPKPs[0])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Mint a new PKP for current auth method
   */
  const createAccount = useCallback(
    async (authMethod: AuthMethod): Promise<void> => {
      setLoading(true)
      setError(undefined)
      try {
        let newPKP
        fetchAccount(authMethod)
        if (!currentAccount) {
          newPKP = await mintPKP(authMethod)
          sessionStorage.setItem("account", JSON.stringify(newPKP))
          setCurrentAccount(newPKP)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    fetchAccount,
    createAccount,
    setCurrentAccount,
    currentAccount,
    loading,
    error,
  }
}
