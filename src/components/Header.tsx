import { ORIGIN, signInWithGoogle } from "@/utils/lit"
import useAccount from "@/hooks/useAccount"
import useAuthenticate from "@/hooks/useAuthenticate"
import useSession from "@/hooks/useSession"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { disconnectWeb3 } from "@lit-protocol/lit-node-client"
import { LOCAL_STORAGE_KEYS } from "@lit-protocol/constants"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import usePkpEthers from "@/hooks/usePkpEthers"
import useBiconomy from "@/hooks/useBiconomy"

export default function Header() {
  const redirectUri = ORIGIN + "/"
  const [pkpEthers, setPkpEthers] = useState<PKPEthersWallet>()

  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri)
  const {
    fetchAccount,
    account,
    setAccount,
    loading: accountLoading,
    error: accountError,
  } = useAccount()
  const {
    initSession,
    sessionKey,
    sessionSigs,
    setSessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useSession()
  const { connect, pkpWallet } = usePkpEthers()
  const { biconomy, init: initBiconomy, docissueContract } = useBiconomy()
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
    if (sessionSigs && account) {
      console.log("Entered here")
      connect(sessionSigs, account)
    }
  }, [sessionSigs, account, connect])

  useEffect(() => {
    if (pkpWallet) {
      initBiconomy(pkpWallet)
    }
    console.log(biconomy)
  }, [pkpWallet, initBiconomy])

  async function handleGoogleLogin() {
    await signInWithGoogle(redirectUri)
  }

  async function handleLogout() {
    disconnectWeb3()
    setAccount(undefined)
    setSessionSigs(undefined)
    typeof window !== "undefined"
      ? localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_KEY)
      : undefined
  }

  function ButtonText() {
    console.log(sessionKey, account, sessionSigs, pkpWallet)
    if (authLoading || accountLoading || sessionLoading) {
      return (
        <div>
          <div className="loader w-6 h-6"></div>
        </div>
      )
    } else if (sessionKey || (account && sessionSigs)) {
      return <span>Sign out</span>
    } else {
      return <span>Sign in with Google</span>
    }
  }

  return (
    <header className="flex justify-between items-center py-12">
      <Link href={"/"} className="font-mono text-2xl">
        Docissue
      </Link>
      <div className="flex items-center gap-6">
        <Link href={"/view"}>View Content</Link>
        <Link href={"/upload"}>Upload Content</Link>
        <Link href={"/issuer/create"}>Become an issuer</Link>
        <button
          type="button"
          className={`flex gap-2 items-center bg-white hover:${
            authLoading || accountLoading || sessionLoading
              ? "cursor-not-allowed opacity-50"
              : "bg-gray-100"
          } text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow`}
          disabled={authLoading || accountLoading || sessionLoading}
          onClick={
            sessionKey || (account && sessionSigs)
              ? handleLogout
              : handleGoogleLogin
          }
        >
          <div className="btn__icon">
            <Image
              src="/icons/google.png"
              alt="Google logo"
              fill={true}
            ></Image>
          </div>
          <ButtonText />
        </button>
      </div>
    </header>
  )
}
