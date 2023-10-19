import { useCallback, useState } from "react"
import { AuthMethod } from "@lit-protocol/types"
import Lit from "@/utils/lit"
import {
  LitAbility,
  LitAccessControlConditionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers"
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
      console.log("Initiating session")
      setLoading(true)
      setError(undefined)
      try {
        // Prepare session sigs params
        const chain = "ethereum"
        const resourceAbilities = [
          {
            resource: new LitPKPResource("*"),
            ability: LitAbility.PKPSigning,
          },
        ]
        const expiration = new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7
        ).toISOString() // 1 week

        console.log({
          pkpPublicKey: pkp.publicKey,
          authMethod,
          sessionSigsParams: {
            chain,
            expiration,
            resourceAbilityRequests: resourceAbilities,
          },
        })

        // Generate session sigs
        const sessionSigs = await Lit.getSessionSigs({
          pkpPublicKey: pkp.publicKey,
          authMethod,
          sessionSigsParams: {
            chain,
            expiration,
            resourceAbilityRequests: [],
          },
        })
        console.log("----------  2 --------------")

        console.log(sessionSigs)
        setSessionSigs(sessionSigs)
      } catch (err) {
        console.log(error)
        setError(err as Error)
      } finally {
        setLoading(false)
        console.log("Initiated session")
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
