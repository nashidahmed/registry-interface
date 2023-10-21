"use client"

import theRegistryAbi from "/public/abis/TheRegistry.json"

import {
  AuthType,
  SismoConnectButton,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react"
import { FormEvent, SetStateAction, useContext, useState } from "react"
import Input from "@/components/Input"
import Textarea from "@/components/Textarea"
import { ethers } from "ethers"
import Button from "@/components/Button"
import useAuthenticate from "@/hooks/useAuthenticate"
import useAccount from "@/hooks/useAccount"
import useSession from "@/hooks/useSession"
import useBiconomy from "@/hooks/useBiconomy"
import Link from "next/link"
import useSismo from "@/hooks/useSismo"
import usePkpEthers from "@/hooks/usePkpEthers"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { WalletContext } from "@/layout"

export default function CreateIssuer() {
  const { pkpWallet, setPkpWallet } = useContext<{
    pkpWallet?: PKPEthersWallet
    setPkpWallet?: React.Dispatch<SetStateAction<PKPEthersWallet>>
  }>(WalletContext)
  const { submitWithPersonalSign, loading, txHash } = useBiconomy()

  const theRegistryContract = process.env
    .NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as string

  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [image, setImage] = useState("")
  const [desc, setDesc] = useState("")
  const { responseBytes, setResponse } = useSismo()

  async function createIssuer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (pkpWallet) {
      let contractInterface = new ethers.utils.Interface(theRegistryAbi)
      let functionSignature = contractInterface.encodeFunctionData(
        "createIssuer",
        [responseBytes, name, website, desc, image]
      )

      submitWithPersonalSign(
        functionSignature,
        pkpWallet,
        process.env.NEXT_PUBLIC_BICONOMY_CREATE_API_ID as string
      )
    }
  }

  return (
    <div className="w-full">
      <header className="h-24 flex items-center justify-center text-4xl">
        Create a profile
      </header>
      <form
        className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 flex flex-col gap-5 mx-auto"
        onSubmit={createIssuer}
      >
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
              setResponse(bytes)
            }}
            text="Verify Twitter with Sismo"
            overrideStyle={{ height: "2.25rem", fontSize: "1rem" }}
          />
        </div>
        <div className="flex gap-4 mx-auto">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex gap-2">
                Creating Profile
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
      </form>
    </div>
  )
}
