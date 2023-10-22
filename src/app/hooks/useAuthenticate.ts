import { useCallback, useEffect, useState } from "react"
import {
  getProviderFromUrl,
  isSignInRedirect,
} from "@lit-protocol/lit-auth-client"
import { AuthMethod } from "@lit-protocol/types"
import { authenticateWithDiscord, authenticateWithGoogle } from "@/utils/lit"

export default function useAuthenticate(redirectUri?: string) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()

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
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [redirectUri])

  /**
   * Handle redirect from Discord OAuth
   */
  const authWithDiscord = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(undefined)
    setAuthMethod(undefined)

    try {
      const result: AuthMethod = (await authenticateWithDiscord(
        redirectUri as any
      )) as any
      setAuthMethod(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [redirectUri])

  useEffect(() => {
    // Check if user is redirected from social login
    if (redirectUri && isSignInRedirect(redirectUri)) {
      // If redirected, authenticate with social provider
      const providerName = getProviderFromUrl()
      if (providerName === "google") {
        authWithGoogle()
      } else if (providerName === "discord") {
        authWithDiscord()
      }
    }
  }, [redirectUri, authWithGoogle, authWithDiscord])

  return {
    authMethod,
    loading,
    error,
  }
}
