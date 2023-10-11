"use client"

import docissueAbi from "@public/abis/Docissue.json"

import {
  AuthType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react"
import { useState } from "react"
import { writeContract } from "@wagmi/core"
import { useAccount } from "wagmi"

export default function CreateIssuer() {
  const [responseBytes, setResponseBytes] = useState("")
  const { address } = useAccount()

  async function createIssuer() {
    const { hash } = await writeContract({
      address: "0x8E1b5b3721155A54860a56e3A03e991Cb677Fa8a",
      abi: docissueAbi,
      functionName: "createIssuer",
      args: [responseBytes],
    })

    console.log(hash)
  }

  return (
    <div>
      Issuer {responseBytes}
      <SismoConnectButton
        config={{
          appId: "0xd6e0a23df3d426bf3b5f232ff4c69058", // replace with your appId

          // displayRawResponse: true,
        }}
        // request proof of Data Sources ownership (e.g EVM, GitHub, twitter or telegram)
        auth={{ authType: AuthType.TWITTER }}
        onResponse={(test: any) => {
          console.log(test)
        }}
        // reponse in bytes to call a contract
        onResponseBytes={(bytes: string) => {
          setResponseBytes(bytes)
        }}
      />
      <button onClick={createIssuer}>Create Issuer</button>
    </div>
  )
}
