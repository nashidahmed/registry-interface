import { useCallback, useEffect, useState } from "react"
import { AuthMethod } from "@lit-protocol/types"
import Lit from "@/utils/lit"
import { IRelayPKP } from "@lit-protocol/types"
import { useRouter } from "next/navigation"

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
        if (myPKPs.length > 0) {
          setAccount(myPKPs[0])
        } else {
          const newPKP = await Lit.mintPKP(authMethod)
          setAccount(newPKP)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    // If user is authenticated, fetch accounts
    if (authMethod) {
      console.log(authMethod, account)
      router.replace(window.location.pathname, undefined)
      fetchAccount(authMethod)
    }
  }, [authMethod])

  return {
    fetchAccount,
    setAccount,
    account,
    loading,
    error,
  }
}
