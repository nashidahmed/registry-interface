"use client"

import theRegistryAbi from "/public/abis/TheRegistry.json"

import {
  AuthType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react"
import { FormEvent, useContext, useState } from "react"
import Input from "@/components/Input"
import Textarea from "@/components/Textarea"
import { ethers } from "ethers"
import Button from "@/components/Button"
import useAuthenticate from "@/hooks/useAuthenticate"
import useAccount from "@/hooks/useAccount"
import useSession from "@/hooks/useSession"
import useBiconomy from "@/hooks/useBiconomy"
import Link from "next/link"

export default function CreateIssuer() {
  const { getAuthMethod } = useAuthenticate()
  const { getAccount } = useAccount()
  const { initSession } = useSession()
  const { submitWithPersonalSign, loading, txHash } = useBiconomy()

  const theRegistryContract = process.env
    .NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as string

  const [responseBytes, setResponseBytes] = useState("")
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [image, setImage] = useState("")
  const [desc, setDesc] = useState("")

  async function createIssuer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    let userAddress = "0xd697b55Daf2add294F8f1C58377253573E5A61c8"

    let contractInterface = new ethers.utils.Interface(theRegistryAbi)
    let functionSignature = contractInterface.encodeFunctionData(
      "createIssuer",
      [responseBytes, name, website, image, desc]
    )

    submitWithPersonalSign(functionSignature, userAddress)
  }

  function init() {
    const authMethod = getAuthMethod()
    const account = getAccount()
    console.log(getAuthMethod(), getAccount())
    // If user is authenticated and has selected an account, initialize session
    if (authMethod && account) {
      initSession(authMethod, account)
    }
  }

  return (
    <div className="px-96">
      <header className="h-32 flex items-center justify-center text-4xl">
        Create a profile
      </header>
      <form className="container" onSubmit={createIssuer}>
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
        <div className="flex gap-4 mx-auto">
          <Button type="submit">
            {loading ? (
              <div className="flex gap-2">
                Create Profile
                <div>
                  <div className="loader w-5 h-5"></div>
                </div>
              </div>
            ) : (
              "Create Profile"
            )}
          </Button>
        </div>
        {txHash && (
          <div className="text-center">
            Created Profile successfully.
            <br />
            Tx ID:{" "}
            <Link
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              href={`https://mumbai.polygonscan.com/tx/${txHash}`}
              passHref
              target="_blank"
            >
              {txHash}
            </Link>
          </div>
        )}

        <div className="mx-auto">
          <Button onClick={() => init()}>Init session</Button>
        </div>
      </form>
    </div>
  )
}
