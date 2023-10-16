import { useCallback, useState } from "react"
import { AuthMethod } from "@lit-protocol/types"
import { getPKPs, mintPKP } from "@/utils/lit"
import { IRelayPKP } from "@lit-protocol/types"

export default function useAccount() {
  const [account, setAccount] = useState<IRelayPKP>()
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
        if (myPKPs.length > 0) {
          setAccount(myPKPs[0])
        } else {
          const newPKP = await mintPKP(authMethod)
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

  return {
    fetchAccount,
    setAccount,
    account,
    loading,
    error,
  }
}
