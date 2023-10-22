"use client"

import theRegistryAbi from "/public/abis/TheRegistry.json"

import { AuthType, SismoConnectButton } from "@sismo-core/sismo-connect-react"
import {
  FormEvent,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import Input from "@/components/Input"
import Textarea from "@/components/Textarea"
import { ethers } from "ethers"
import Button from "@/components/Button"
import useBiconomy from "@/hooks/useBiconomy"
import Link from "next/link"
import useSismo from "@/hooks/useSismo"
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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("create-form")
    ) {
      const formData = JSON.parse(
        sessionStorage.getItem("create-form") as string
      )
      if (formData.name) setName(formData.name)
      if (formData.website) setWebsite(formData.website)
      if (formData.desc) setDesc(formData.desc)
      if (formData.image) setImage(formData.image)
    }
  }, [])

  async function createIssuer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (pkpWallet) {
      sessionStorage.getItem("create-form")

      let contractInterface = new ethers.utils.Interface(theRegistryAbi)
      let functionSignature = contractInterface.encodeFunctionData(
        "createIssuer",
        [responseBytes, name, pkpWallet.address, website, desc, image]
      )

      submitWithPersonalSign(
        functionSignature,
        pkpWallet,
        process.env.NEXT_PUBLIC_BICONOMY_CREATE_API_ID as string
      )
    }
  }

  function saveForm() {
    // const formData = {
    //   name,
    //   website,
    //   image,
    //   desc,
    // }
    // sessionStorage.setItem("create-form", JSON.stringify(formData))
  }

  return (
    <div className="w-full">
      <header className="h-24 flex items-center justify-center text-4xl">
        Create a profile
      </header>
      <form
        className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-2xl sm:p-6 md:p-8 flex flex-col gap-5 mx-auto"
        onSubmit={createIssuer}
      >
        <Input
          id="organization_name"
          label="Organization Name"
          placeholder="XYZ University"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveForm}
        />

        <Input
          id="website_link"
          label="Website link"
          value={website}
          placeholder="https://www.example.com/"
          onChange={(e) => setWebsite(e.target.value)}
          onBlur={saveForm}
        />
        <Input
          id="image_link"
          label="Image link (rounded)"
          value={image}
          placeholder="https://www.example-host.com/image.png"
          onChange={(e) => setImage(e.target.value)}
          onBlur={saveForm}
        />
        <Textarea
          id="short_description"
          label="Give a short description of your organization"
          value={desc}
          placeholder="Enter a short description (Eg. Official account of XYZ University)"
          onChange={(e) => setDesc(e.target.value)}
          onBlur={saveForm}
        />
        <div className="mx-auto flex flex-col items-center">
          <SismoConnectButton
            config={{
              appId: process.env.NEXT_PUBLIC_SISMO_APP_ID as string,
              vault: {
                impersonate: [
                  "twitter:MIT",
                  "twitter:UniofOxford",
                  "twitter:iitbombay",
                  "twitter:UAL",
                ],
              },
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
