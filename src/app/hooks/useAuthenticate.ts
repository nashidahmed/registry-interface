import { useCallback, useEffect, useState } from "react"
import { isSignInRedirect } from "@lit-protocol/lit-auth-client"
import { AuthMethod } from "@lit-protocol/types"
import Lit from "@/utils/lit"
import { useConnect } from "wagmi"

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
      const result: AuthMethod = (await Lit.authenticateWithGoogle(
        redirectUri as string
      )) as AuthMethod
      console.log(result)
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
      authWithGoogle()
    }
    console.log(authMethod)
  }, [redirectUri])

  return {
    authMethod,
    loading,
    error,
  }
}
