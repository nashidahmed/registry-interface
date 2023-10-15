"use client"

import { IRelayPKP, SessionSigs } from "@lit-protocol/types"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { useAccount, useDisconnect } from "wagmi"
import { useRouter } from "next/navigation"
import useAccounts from "@/hooks/useAccounts"
import useAuthenticate from "@/hooks/useAuthenticate"
import { ORIGIN } from "../utils/lit"
import useSession from "@/hooks/useSession"
import Loading from "@/components/Loading"
import CreateAccount from "@/components/CreateAccount"
import AccountSelection from "@/components/AccountSelection"

export default function Dashboard() {
  const [signature, setSignature] = useState<string>()
  const [verified, setVerified] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()

  const { disconnectAsync } = useDisconnect()
  const router = useRouter()
  const { currentAccount } = useAccounts()

  const { sessionSigs } = useSession()

  console.log(currentAccount)

  async function handleLogout() {
    try {
      await disconnectAsync()
    } catch (err) {}
    localStorage.removeItem("lit-wallet-sig")
    router.push("/login")
  }

  return (
    <div className="container mx-auto mt-24">
      <div className="logout-container">
        <button className="btn btn--link" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <h1>Ready for the open web</h1>
      <div className="details-card">
        <p>My address: {currentAccount?.ethAddress.toLowerCase()}</p>
      </div>
    </div>
  )
}
