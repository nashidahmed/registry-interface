"use client"

import { useEffect, useState } from "react"
import useAuthenticate from "@/hooks/useAuthenticate"
import useSession from "@/hooks/useSession"
import useAccounts from "@/hooks/useAccounts"
import { ORIGIN, signInWithGoogle } from "@/utils/lit"
import Loading from "@/components/Loading"
import AuthMethods from "@/components/AuthMethods"
import WalletMethods from "@/components/WalletMethods"
import AccountSelection from "@/components/AccountSelection"
import CreateAccount from "@/components/CreateAccount"
import { useRouter } from "next/navigation"
import Link from "next/link"

type AuthView = "default" | "wallet"

export default function LoginView() {
  const [view, setView] = useState<AuthView>("default")
  const redirectUri = ORIGIN + "/login"

  const {
    authMethod,
    authWithEthWallet,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri)
  const {
    fetchAccounts,
    setCurrentAccount,
    currentAccount,
    accounts,
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

  function goToSignUp() {
    router.push("/signup")
  }

  useEffect(() => {
    // If user is authenticated, fetch accounts
    if (authMethod) {
      router.replace(window.location.pathname, undefined)
      fetchAccounts(authMethod)
    }
  }, [authMethod, fetchAccounts])

  useEffect(() => {
    // If user is authenticated and has selected an account, initialize session
    if (authMethod && currentAccount) {
      initSession(authMethod, currentAccount)
    }
  }, [authMethod, currentAccount, initSession])

  if (authLoading) {
    return <Loading copy={"Authenticating your credentials..."} error={error} />
  }

  if (accountsLoading) {
    return <Loading copy={"Looking up your accounts..."} error={error} />
  }

  if (sessionLoading) {
    return <Loading copy={"Securing your session..."} error={error} />
  }

  // If user is authenticated and has selected an account, initialize session
  if (currentAccount && sessionSigs) {
    router.push("/dashboard")
  }

  // If user is authenticated and has more than 1 account, show account selection
  if (authMethod && accounts.length > 0) {
    return (
      <AccountSelection
        accounts={accounts}
        setCurrentAccount={setCurrentAccount}
        error={error}
      />
    )
  }

  // If user is authenticated but has no accounts, prompt to create an account
  if (authMethod && accounts.length === 0) {
    return <CreateAccount signUp={goToSignUp} error={error} />
  }

  // If user is not authenticated, show login methods
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
            <h1>Welcome back</h1>
            <p>Access your Lit wallet.</p>
            <AuthMethods
              handleGoogleLogin={handleGoogleLogin}
              setView={setView}
            />
            <div className="buttons-container">
              <Link className="btn btn--link" href={"/signup"}>
                Need an account? Sign up
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
