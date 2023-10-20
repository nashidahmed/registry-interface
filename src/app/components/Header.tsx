import { ORIGIN, signInWithGoogle } from "@/utils/lit"
import useAccount from "@/hooks/useAccount"
import useAuthenticate from "@/hooks/useAuthenticate"
import useSession from "@/hooks/useSession"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SetStateAction, useContext, useEffect, useState } from "react"
import Image from "next/image"
import { disconnectWeb3 } from "@lit-protocol/lit-node-client"
import { LOCAL_STORAGE_KEYS } from "@lit-protocol/constants"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import usePkpEthers from "@/hooks/usePkpEthers"
import { WalletContext } from "@/layout"

export default function Header() {
  const pathname = usePathname()
  const redirectUri = ORIGIN + pathname
  const { pkpWallet, setPkpWallet } = useContext<{
    pkpWallet: PKPEthersWallet | undefined
    setPkpWallet: React.Dispatch<SetStateAction<PKPEthersWallet | undefined>>
  }>(WalletContext)

  const {
    authMethod,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri)
  const {
    account,
    fetchAccount,
    setAccount,
    loading: accountLoading,
    error: accountError,
  } = useAccount(authMethod)

  const {
    initSession,
    sessionKey,
    sessionSigs,
    setSessionSigs,
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
    if (sessionSigs && account) {
      connect(sessionSigs, account)
    }
  }, [sessionSigs, account, connect])

  useEffect(() => {
    if (pkpEthers) {
      setPkpWallet(pkpEthers)
      console.log(pkpEthers)
    }
  }, [pkpEthers])

  async function handleGoogleLogin() {
    await signInWithGoogle(redirectUri)
  }

  async function handleLogout() {
    disconnectWeb3()
    setPkpWallet(undefined)
    typeof window !== "undefined"
      ? localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_KEY)
      : undefined
  }

  function ButtonText() {
    // console.log(authLoading, accountLoading, account)
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
      return <span>Sign in with Google</span>
    }
  }

  return (
    <header className="flex justify-between items-center py-12">
      <Link href={"/"} className="font-mono text-2xl">
        The Registry
      </Link>
      <div className="flex items-center gap-6">
        <Link href={"/upload"}>Upload Content</Link>
        <Link href={"/issuer/create"}>Become an issuer</Link>
        <button
          type="button"
          className={`flex gap-2 items-center bg-white hover:${
            authLoading || accountLoading || sessionLoading || pkpLoading
              ? "cursor-not-allowed opacity-50"
              : "bg-gray-100"
          } text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow`}
          disabled={
            authLoading || accountLoading || sessionLoading || pkpLoading
          }
          onClick={pkpWallet ? handleLogout : handleGoogleLogin}
        >
          <div className="btn__icon">
            <object data="/icons/google.svg" type="image/svg+xml"></object>
          </div>
          <div className="flex gap-2 items-center">
            <ButtonText />
          </div>
        </button>
      </div>
    </header>
  )
}
