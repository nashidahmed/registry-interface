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
import Input from "@/components/Input"
import Textarea from "@/components/Textarea"
import { ethers } from "ethers"
import Button from "@/components/Button"

export default function CreateIssuer() {
  const [responseBytes, setResponseBytes] = useState("")
  const { address } = useAccount()
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [image, setImage] = useState("")
  const [desc, setDesc] = useState("")

  async function createIssuer() {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_INFURA_RPC
    )
    const signer = new ethers.Wallet(
      process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
      provider
    )

    let contractInterface = new ethers.Contract(
      process.env.NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as string,
      docissueAbi,
      signer
    )
    // let functionSignature = contractInterface.encodeFunctionData(
    //   "createIssuer",
    //   [responseBytes, name, website, desc]
    // )
    // let rawTx = {
    //   to: process.env.NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS,
    //   data: functionSignature,
    //   from: "0xd697b55Daf2add294F8f1C58377253573E5A61c8",
    // }
    // let signedTx = await signer.signTransaction(rawTx);
    // const tx = await signer.sendTransaction({
    //   to: "0x160877899134C796E7eeA983364F88e0d1Fb0252",
    //   value: ethers.utils.parseUnits("0.001", "ether"),
    // })
    console.log(
      await contractInterface.createIssuer(
        responseBytes,
        name,
        website,
        image,
        desc
      )
    )

    // const { hash } = await writeContract({
    //   address: process.env
    //     .NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as `0x${string}`,
    //   abi: docissueAbi,
    //   functionName: "createIssuer",
    //   args: [responseBytes, name, website, desc],
    // })

    // console.log(hash)
  }

  return (
    <div className="px-96">
      <header className="h-32 flex items-center justify-center text-4xl">
        Create a profile
      </header>
      <div className="container">
        <Input
          id="organization_name"
          label="Organization Name"
          placeholder="XYZ University"
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          id="website_link"
          label="Website link"
          placeholder="https://www.example.com/"
          onChange={(e) => setWebsite(e.target.value)}
        />
        <Input
          id="image_link"
          label="Image link (rounded)"
          placeholder="https://www.example-host.com/image.png"
          onChange={(e) => setImage(e.target.value)}
        />
        <Textarea
          id="short_description"
          label="Give a short description of your organization"
          placeholder="Enter a short description (Eg. Official account of XYZ University)"
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className="mx-auto">
          <SismoConnectButton
            config={{
              appId: process.env.NEXT_PUBLIC_SISMO_APP_ID as string,
            }}
            auth={{ authType: AuthType.TWITTER }}
            onResponseBytes={(bytes: string) => {
              setResponseBytes(bytes)
            }}
            text="Verify Twitter with Sismo"
            overrideStyle={{ height: "2.25rem", fontSize: "1rem" }}
          />
        </div>
        <div className="mx-auto">
          <Button onClick={createIssuer}>Create Profile</Button>
        </div>
      </div>
    </div>
  )
}
