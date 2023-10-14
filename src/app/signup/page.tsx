"use client"

import { useState } from "react"

import AuthMethods from "../../components/AuthMethods"
import EmailSMSAuth from "../../components/EmailSMSAuth"
import WalletMethods from "../../components/WalletMethods"

interface SignUpProps {
  handleGoogleLogin: () => Promise<void>
  authWithEthWallet: any
  authWithOTP: any
  goToLogin: any
  error?: Error
}

type AuthView = "default" | "email" | "phone" | "wallet" | "webauthn"

export default function SignUp({
  handleGoogleLogin,
  authWithEthWallet,
  authWithOTP,
  goToLogin,
  error,
}: SignUpProps) {
  const [view, setView] = useState<AuthView>("default")

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
              <button
                type="button"
                className="btn btn--link"
                onClick={goToLogin}
              >
                Have an account? Log in
              </button>
            </div>
          </>
        )}
        {view === "email" && (
          <EmailSMSAuth
            method={"email"}
            setView={setView}
            authWithOTP={authWithOTP}
          />
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
