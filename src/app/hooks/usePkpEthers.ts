import { LIT_CHAINS } from "@/utils/constants"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { useCallback, useEffect, useState } from "react"
import { SessionSigs, IRelayPKP } from "@lit-protocol/types"

export default function usePkpEthers() {
  const [pkpWallet, setPkpWallet] = useState<PKPEthersWallet>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error>()

  const connect = useCallback(
    async (sessionSigs: SessionSigs, account: IRelayPKP): Promise<void> => {
      setLoading(true)
      setError(undefined)
      try {
        const wallet = new PKPEthersWallet({
          controllerSessionSigs: sessionSigs,
          // Or you can also pass in controllerSessionSigs
          pkpPubKey: account?.publicKey as string,
          rpc: process.env.NEXT_PUBLIC_INFURA_RPC,
        })
        await wallet.init()
        localStorage.setItem("pkpWallet", JSON.stringify(wallet))
        console.log(wallet)
        setPkpWallet(wallet)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("pkpWallet") && !pkpWallet) {
        setPkpWallet(pkpWallet)
      }
    }
  }, [pkpWallet])

  return {
    connect,
    pkpWallet,
  }
}
