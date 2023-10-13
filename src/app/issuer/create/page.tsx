"use client"

import docissueAbi from "/public/abis/Docissue.json"

import {
  AuthType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react"
import { useState } from "react"
import { writeContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import { Button, Card, Input } from "@ensdomains/thorin"

export default function CreateIssuer() {
  const [responseBytes, setResponseBytes] = useState("")
  const { address } = useAccount()
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [desc, setDesc] = useState("")

  async function createIssuer() {
    const { hash } = await writeContract({
      address: process.env
        .NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as `0x${string}`,
      abi: docissueAbi,
      functionName: "createIssuer",
      args: [responseBytes, name, website, desc],
    })

    console.log(hash)
  }

  return (
    <div className="px-96">
      <header className="text-center pt-4 pb-8 text-2xl">
        Become an issuer
      </header>
      <Card>
        <Input
          label="Name"
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Website"
          placeholder="Enter your website link"
          onChange={(e) => setWebsite(e.target.value)}
        />
        <Input
          label="Description"
          placeholder="Enter a short description (Eg. Official account of University)"
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className="mx-auto">
          <SismoConnectButton
            config={{
              appId: process.env.NEXT_PUBLIC_SISMO_APP_ID as string,
            }}
            auth={{ authType: AuthType.TWITTER }}
            onResponse={(test: any) => {
              console.log(test)
            }}
            onResponseBytes={(bytes: string) => {
              setResponseBytes(bytes)
            }}
            text="Verify Twitter with Sismo"
          />
        </div>
        <div className="mx-auto">
          <Button className="w-fit" onClick={createIssuer}>
            Create Issuer
          </Button>
        </div>
      </Card>
    </div>
  )
}
