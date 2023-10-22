import { ORIGIN, signInWithDiscord, signInWithGoogle } from "@/utils/lit"
import useAccount from "@/hooks/useAccount"
import useAuthenticate from "@/hooks/useAuthenticate"
import useSession from "@/hooks/useSession"
import { SetStateAction, useContext, useEffect } from "react"
import { disconnectWeb3 } from "@lit-protocol/lit-node-client"
import { LOCAL_STORAGE_KEYS } from "@lit-protocol/constants"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import usePkpEthers from "@/hooks/usePkpEthers"
import { WalletContext } from "@/layout"
import { SessionSigs } from "@lit-protocol/types"
import { usePathname, useRouter } from "next/navigation"

export default function DiscordSignIn() {
  const pathname = usePathname()
  const redirectUri = ORIGIN + pathname

  const { pkpWallet, setPkpWallet, setSessionSigs } = useContext<{
    pkpWallet?: PKPEthersWallet | undefined
    setPkpWallet?: React.Dispatch<SetStateAction<PKPEthersWallet | undefined>>
    setSessionSigs?: React.Dispatch<SetStateAction<SessionSigs | undefined>>
  }>(WalletContext)

  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri)
  const {
    account,
    fetchAccount,
    loading: accountLoading,
    error: accountError,
  } = useAccount(authMethod)

  const {
    initSession,
    sessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useSession()
  const { connect, loading: pkpLoading, pkpEthers } = usePkpEthers()
  const router = useRouter()

  const error = authError || accountError || sessionError

  useEffect(() => {
    // If user is authenticated, fetch accounts
    if (authMethod) {
      router.replace(window.location.pathname, undefined)
      fetchAccount(authMethod)
    }
  }, [authMethod, fetchAccount])

  useEffect(() => {
    // If user is authenticated and has selected an account, initialize session
    if (authMethod && account) {
      initSession(authMethod, account)
    }
  }, [authMethod, account, initSession])

  useEffect(() => {
    // If user is authenticated and has selected an account, initialize session
    if (sessionSigs && account && setSessionSigs) {
      setSessionSigs(sessionSigs)
      connect(sessionSigs, account)
    }
  }, [sessionSigs, account, connect])

  useEffect(() => {
    if (pkpEthers && setPkpWallet) {
      setPkpWallet(pkpEthers)
    }
  }, [pkpEthers])

  async function handleDiscordLogin() {
    await signInWithDiscord(redirectUri)
  }

  async function handleLogout() {
    disconnectWeb3()
    setPkpWallet && setPkpWallet(undefined)
    typeof window !== "undefined"
      ? localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_KEY)
      : undefined
  }

  function ButtonText() {
    if (authLoading) {
      return (
        <>
          Authenticating
          <div className="loader w-6 h-6"></div>
        </>
      )
    } else if (accountLoading) {
      return (
        <>
          Loading Account
          <div className="loader w-6 h-6"></div>
        </>
      )
    } else if (sessionLoading) {
      return (
        <>
          Securing session
          <div className="loader w-6 h-6"></div>
        </>
      )
    } else if (pkpLoading) {
      return (
        <>
          Setting up wallet
          <div className="loader w-6 h-6"></div>
        </>
      )
    } else if (pkpWallet) {
      return <span>Sign out</span>
    } else {
      return <span>Sign in with Discord</span>
    }
  }

  return (
    <button
      type="button"
      className={`flex gap-2 items-center bg-white hover:disabled:cursor-not-allowed disabled:opacity-75 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow-2xl`}
      disabled={authLoading || accountLoading || sessionLoading || pkpLoading}
      onClick={pkpWallet ? handleLogout : handleDiscordLogin}
    >
      <object
        className="h-8 w-8"
        data="/icons/discord.svg"
        type="image/svg+xml"
      ></object>
      <div className="flex gap-2 items-center">
        <ButtonText />
      </div>
    </button>
  )
}
