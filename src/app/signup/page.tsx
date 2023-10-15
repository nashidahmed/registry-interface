"use client"

import { useEffect, useState } from "react"

import AuthMethods from "@/components/AuthMethods"
import WalletMethods from "@/components/WalletMethods"
import Loading from "@/components/Loading"
import { ORIGIN, signInWithGoogle } from "../utils/lit"
import useSession from "@/hooks/useSession"
import useAccounts from "@/hooks/useAccounts"
import useAuthenticate from "@/hooks/useAuthenticate"
import { useRouter } from "next/navigation"
import Link from "next/link"

type AuthView = "default" | "wallet"

export default function SignUp() {
  const [view, setView] = useState<AuthView>("default")
  const redirectUri = ORIGIN + "/signup"
  console.log(redirectUri)

  const {
    authMethod,
    authWithEthWallet,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri)
  const {
    createAccount,
    currentAccount,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts()
  const {
    initSession,
    sessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useSession()
  const router = useRouter()

  const error = authError || accountsError || sessionError

  async function handleGoogleLogin() {
    await signInWithGoogle(redirectUri)
  }

  useEffect(() => {
    if (authMethod) {
      router.replace(window.location.pathname, undefined)
      createAccount(authMethod)
    }
  }, [authMethod, createAccount])

  useEffect(() => {
    // If user is authenticated and has at least one account, initialize session
    if (authMethod && currentAccount) {
      initSession(authMethod, currentAccount)
    }
  }, [authMethod, currentAccount, initSession])

  if (authLoading) {
    return <Loading copy={"Authenticating your credentials..."} error={error} />
  }

  if (accountsLoading) {
    return <Loading copy={"Creating your account..."} error={error} />
  }

  if (sessionLoading) {
    return <Loading copy={"Securing your session..."} error={error} />
  }

  // If user is authenticated and has selected an account, initialize session
  if (currentAccount && sessionSigs) {
    router.push("/dashboard")
  }

  return (
    <div className="container mx-auto mt-24">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        {view === "default" && (
          <>
            <h1>Getting Started</h1>
            <p>
              Create a wallet that is secured by accounts you already have. If
              you received documents on the dApp, sign up with the assoicated
              method.
            </p>
            <AuthMethods
              handleGoogleLogin={handleGoogleLogin}
              setView={setView}
            />
            <div className="buttons-container">
              <Link className="btn btn--link" href={"/login"}>
                Have an account? Log in
              </Link>
            </div>
          </>
        )}
        {view === "wallet" && (
          <WalletMethods
            authWithEthWallet={authWithEthWallet}
            setView={setView}
          />
        )}
      </div>
    </div>
  )
}
