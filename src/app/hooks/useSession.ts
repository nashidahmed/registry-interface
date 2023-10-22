import { useCallback, useState } from "react"
import { AuthMethod } from "@lit-protocol/types"
import { getSessionSigs } from "@/utils/lit"
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers"
import { IRelayPKP } from "@lit-protocol/types"
import { SessionSigs, SessionKeyPair } from "@lit-protocol/types"
import { LOCAL_STORAGE_KEYS } from "@lit-protocol/constants"

export default function useSession() {
  const sessionKey: SessionKeyPair =
    typeof window !== "undefined"
      ? localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_KEY) &&
        JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_KEY) as string
        )
      : undefined
  const [sessionSigs, setSessionSigs] = useState<SessionSigs>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()

  /**
   * Generate session sigs and store new session data
   */
  const initSession = useCallback(
    async (authMethod: AuthMethod, pkp: IRelayPKP): Promise<void> => {
      setLoading(true)
      setError(undefined)
      try {
        // Prepare session sigs params
        const chain = "ethereum"
        const resourceAbilities = [
          {
            resource: new LitActionResource("*"),
            ability: LitAbility.PKPSigning,
          },
        ]
        const expiration = new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7
        ).toISOString() // 1 week

        // Generate session sigs
        const sessionSigs = await getSessionSigs({
          pkpPublicKey: pkp.publicKey,
          authMethod,
          sessionSigsParams: {
            chain,
            expiration,
            resourceAbilityRequests: resourceAbilities,
          },
        })

        setSessionSigs(sessionSigs)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    initSession,
    sessionKey,
    sessionSigs,
    setSessionSigs,
    loading,
    error,
  }
}
