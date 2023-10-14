import { useCallback, useEffect, useState } from "react"
import { isSignInRedirect } from "@lit-protocol/lit-auth-client"
import { AuthMethod } from "@lit-protocol/types"
import {
  authenticateWithGoogle,
  authenticateWithEthWallet,
  authenticateWithStytch,
} from "../utils/lit"
import { useConnect } from "wagmi"

export default function useAuthenticate(redirectUri?: string) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()

  // wagmi hook
  const { connectAsync } = useConnect({
    onError: (err: unknown) => {
      setError(err as Error)
    },
  })

  /**
   * Handle redirect from Google OAuth
   */
  const authWithGoogle = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(undefined)
    setAuthMethod(undefined)

    try {
      const result: AuthMethod = (await authenticateWithGoogle(
        redirectUri as any
      )) as any
      setAuthMethod(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [redirectUri])

  /**
   * Authenticate with Ethereum wallet
   */
  const authWithEthWallet = useCallback(
    async (connector: any): Promise<void> => {
      setLoading(true)
      setError(undefined)
      setAuthMethod(undefined)

      try {
        const { account, connector: activeConnector } = await connectAsync(
          connector
        )
        const signer = await activeConnector.getSigner()
        const signMessage = async (message: string) => {
          const sig = await signer.signMessage(message)
          return sig
        }
        const result: AuthMethod = await authenticateWithEthWallet(
          account,
          signMessage
        )
        setAuthMethod(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    },
    [connectAsync]
  )

  /**
   * Authenticate with Stytch
   */
  const authWithStytch = useCallback(
    async (accessToken: string, userId?: string): Promise<void> => {
      setLoading(true)
      setError(undefined)
      setAuthMethod(undefined)

      try {
        const result: AuthMethod = (await authenticateWithStytch(
          accessToken,
          userId
        )) as any
        setAuthMethod(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    // Check if user is redirected from social login
    if (redirectUri && isSignInRedirect(redirectUri)) {
      // If redirected, authenticate with social provider
      authWithGoogle()
    }
  }, [redirectUri, authWithGoogle])

  return {
    authWithEthWallet,
    authWithStytch,
    authMethod,
    loading,
    error,
  }
}
