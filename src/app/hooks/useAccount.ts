import { useCallback, useContext, useEffect, useState } from "react"
import { AuthMethod } from "@lit-protocol/types"
import { IRelayPKP } from "@lit-protocol/types"
import { useRouter } from "next/navigation"
import { LIT_ACCOUNT } from "@/utils/constants"
import { getPKPs, mintPKP } from "@/utils/lit"

export default function useAccount(authMethod?: AuthMethod) {
  const [account, setAccount] = useState<IRelayPKP | undefined>()
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
        const myPKPs = await getPKPs(authMethod)
        let newPKP
        if (myPKPs.length > 0) {
          newPKP = myPKPs[0]
        } else {
          newPKP = await mintPKP(authMethod)
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
    account,
    loading,
    error,
  }
}
