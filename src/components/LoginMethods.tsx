import { useState } from "react"

import AuthMethods from "./AuthMethods"
import EmailSMSAuth from "./EmailSMSAuth"
import WalletMethods from "./WalletMethods"

interface LoginProps {
  handleGoogleLogin: () => Promise<void>
  authWithEthWallet: any
  signUp: any
  error?: Error
}

type AuthView = "default" | "email" | "phone" | "wallet" | "webauthn"

export default function LoginMethods({
  handleGoogleLogin,
  authWithEthWallet,
  signUp,
  error,
}: LoginProps) {
  const [view, setView] = useState<AuthView>("default")

  return (
    <div className="container">
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
            <div className="buttons-container">
              <button type="button" className="btn btn--link" onClick={signUp}>
                Need an account? Sign up
              </button>
            </div>
          </>
        )}
        {/* {view === 'phone' && (
          <EmailSMSAuth
            method={'phone'}
            setView={setView}
            authWithOTP={authWithOTP}
          />
        )} */}
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
