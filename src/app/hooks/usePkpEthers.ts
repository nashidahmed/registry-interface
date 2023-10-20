import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { useCallback, useState } from "react"
import { SessionSigs, IRelayPKP } from "@lit-protocol/types"

export default function usePkpEthers() {
  const [pkpEthers, setPkpEthers] = useState<PKPEthersWallet>()
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
          rpc: process.env.NEXT_PUBLIC_INFURA_RPC as string,
        })
        await wallet.init()
        setPkpEthers(wallet)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    connect,
    pkpEthers,
    loading,
  }
}
