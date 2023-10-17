import { Biconomy } from "@biconomy/mexa"
import { Contract, ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"
import docissueAbi from "/public/abis/Docissue.json"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"

// The first argument of the Biconomy class is an EIP 1193 type provider that has to be passed.
// If there is a type mismatch you'll have to set the type of the provider as
// External Provider
export type ExternalProvider = {
  isMetaMask?: boolean
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void
  // send?: (
  //   request: { method: string; params?: Array<any> },
  //   callback: (error: any, response: any) => void
  // ) => void
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>
}

export default function useBiconomy() {
  const [biconomy, setBiconomy] = useState<Biconomy>()
  const [docissueContract, setDocissueContract] = useState<Contract>()

  const init = useCallback(
    async (pkpWallet: PKPEthersWallet): Promise<void> => {
      console.log("--------      1         ------------")
      const biconomy = new Biconomy(pkpWallet.rpcProvider as ExternalProvider, {
        apiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY as string,
        debug: true,
        contractAddresses: [
          process.env.NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as string,
        ], // list of contract address you want to enable gasless on
      })
      console.log("--------      2         ------------")

      // To create contract instances you can do:
      const contractInstance = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as string,
        docissueAbi,
        biconomy.ethersProvider
      )
      setDocissueContract(contractInstance)
      console.log("--------      3         ------------")

      console.log(biconomy)
      await biconomy.init()
    },
    []
  )

  return {
    init,
    biconomy,
    docissueContract,
  }
}
