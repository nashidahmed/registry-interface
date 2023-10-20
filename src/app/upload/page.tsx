"use client"

import theRegistryAbi from "/public/abis/TheRegistry.json"

import { ethers } from "ethers"
import {
  FormEvent,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import { useAccount } from "wagmi"
import { writeContract } from "@wagmi/core"
import { Web3Storage } from "web3.storage"
import Input from "@/components/Input"
import Button from "@/components/Button"
import useAuthenticate from "@/hooks/useAuthenticate"
import useBiconomy from "@/hooks/useBiconomy"
import {
  AuthType,
  SismoConnectButton,
  useSismoConnect,
} from "@sismo-core/sismo-connect-react"
import Link from "next/link"
import useSismo from "@/hooks/useSismo"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { WalletContext } from "@/layout"

export default function Upload() {
  const { pkpWallet, setPkpWallet } = useContext<{
    pkpWallet?: PKPEthersWallet
    setPkpWallet?: React.Dispatch<SetStateAction<PKPEthersWallet>>
  }>(WalletContext)

  const [cid, setCid] = useState<string>()
  const [file, setFile] = useState<File>()
  const [title, setTitle] = useState<string>("")
  const { responseBytes, setResponse } = useSismo()
  const { submitWithPersonalSign, loading, setLoading, txHash } = useBiconomy()

  async function uploadFile() {
    setLoading(true)
    const client = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN as string,
    })

    const cid = await client.put([new File([file as File], "test")], {
      onRootCidReady: (localCid: string) => {
        setCid(localCid)
      },
      onStoredChunk: (bytes: any) => {
        console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
        setLoading(false)
      },
    })

    if (pkpWallet) {
      let contractInterface = new ethers.utils.Interface(theRegistryAbi)
      let functionSignature = contractInterface.encodeFunctionData(
        "uploadDocument",
        [
          responseBytes,
          title,
          cid,
          "0xd697b55Daf2add294F8f1C58377253573E5A61c8",
        ]
      )

      console.log("---------  11----------------")
      submitWithPersonalSign(
        functionSignature,
        pkpWallet,
        process.env.NEXT_PUBLIC_BICONOMY_UPLOAD_API_ID as string
      )
    }
  }

  async function claimKey() {
    // const authMethod = getAuthMethod()
    // console.log(authMethod)
    // Lit.claimKey(authMethod)
    // Lit.authenticate(title)
  }

  // function uploadDocument(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault()
  // }

  // async function handleSubmit(event: FormEvent) {
  //   // don't reload the page!
  //   event.preventDefault()
  //   console.log(`Uploading to Filecoin...`)

  //   const client = new Web3Storage({
  //     token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN as string,
  //   })

  //   console.log(file)

  //   const cid = await client.put([new File([file as File], "test")], {
  //     onRootCidReady: (localCid: string) => {
  //       setCid(localCid)
  //     },
  //     onStoredChunk: (bytes: any) =>
  //       console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`),
  //   })

  //   const { hash } = await writeContract({
  //     address: process.env
  //       .NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as `0x${string}`,
  //     abi: theRegistryAbi,
  //     functionName: "uploadDocument",
  //     args: [title, cid],
  //   })

  //   console.log(hash)
  // }

  async function getPubKey() {
    // await Lit.computeKey("108320763296956109044")
    // await Lit.computeKey("demon.king.115@gmail.com")
  }

  return (
    <div className="px-96">
      <header className="h-32 flex items-center justify-center text-4xl">
        Upload a document
      </header>
      <div className="container">
        <Input
          id="title"
          label="Title"
          placeholder="Enter the document title"
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <input
            type="file"
            id="filepicker"
            name="fileList"
            onChange={(e) => setFile(e.target.files?.[0])}
            required
          />
        </div>
        {!responseBytes && (
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
        )}

        <div className="mx-auto mt-8">
          <Button onClick={uploadFile}>
            {loading ? (
              <div className="flex gap-2">
                Upload Document
                <div>
                  <div className="loader w-5 h-5"></div>
                </div>
              </div>
            ) : (
              "Upload Document"
            )}
          </Button>
        </div>
        {txHash && (
          <div className="text-center">
            Uploaded document successfully.
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

        <div className="mx-auto mt-8">
          <Button onClick={claimKey}>Claim key</Button>
        </div>
        <div className="mx-auto mt-8">
          <Button onClick={getPubKey}>Computer Key</Button>
        </div>
      </div>
    </div>
  )
}
