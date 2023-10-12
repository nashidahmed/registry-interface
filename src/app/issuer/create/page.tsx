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
import { Button, Card, Input } from "@ensdomains/thorin"

export default function CreateIssuer() {
  const [responseBytes, setResponseBytes] = useState("")
  const { address } = useAccount()
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [desc, setDesc] = useState("")

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
            className="w-fit"
            config={{
              appId: "0xd6e0a23df3d426bf3b5f232ff4c69058",
              vault: {
                impersonate: ["twitter:dhadrien_"],
              },
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
