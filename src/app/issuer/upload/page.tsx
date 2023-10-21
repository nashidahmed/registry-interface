"use client"

import theRegistryAbi from "/public/abis/TheRegistry.json"

import { ethers } from "ethers"
import { useContext, useEffect, useState } from "react"
import { Web3Storage } from "web3.storage"
import Input from "@/components/Input"
import Button from "@/components/Button"
import useBiconomy from "@/hooks/useBiconomy"
import { AuthType, SismoConnectButton } from "@sismo-core/sismo-connect-react"
import Link from "next/link"
import useSismo from "@/hooks/useSismo"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { WalletContext } from "@/layout"
import { encrypt, getAddress } from "@/utils/lit"
import { SessionSigs } from "@lit-protocol/types"

export default function Upload() {
  const [isClient, setIsClient] = useState(false)
  const { pkpWallet, sessionSigs } = useContext<{
    pkpWallet?: PKPEthersWallet
    sessionSigs?: SessionSigs
  }>(WalletContext)

  const [cid, setCid] = useState<string>()
  const [file, setFile] = useState<File>()
  const [title, setTitle] = useState<string>("")
  const { responseBytes, setResponse } = useSismo()
  const { submitWithPersonalSign, loading, setLoading, txHash } = useBiconomy()

  useEffect(() => {
    setIsClient(true)
  }, [])

  async function uploadFile() {
    if (file && sessionSigs) {
      setLoading(true)
      const client = new Web3Storage({
        token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN as string,
      })

      const receiver = await getAddress("113478391645363093325")

      const { ciphertext, dataToEncryptHash } = await encrypt(
        file,
        sessionSigs,
        receiver
      )
      console.log(ciphertext, dataToEncryptHash)

      const cid = await client.put([new File([ciphertext], "test")], {
        onRootCidReady: (localCid: string) => {
          setCid(localCid)
        },
        onStoredChunk: (bytes: any) => {
          console.log(
            `> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`
          )
          setLoading(false)
        },
      })

      if (pkpWallet) {
        let contractInterface = new ethers.utils.Interface(theRegistryAbi)
        let functionSignature = contractInterface.encodeFunctionData(
          "uploadDocument",
          [responseBytes, dataToEncryptHash, cid, receiver]
        )

        console.log("---------  11----------------")
        submitWithPersonalSign(
          functionSignature,
          pkpWallet,
          process.env.NEXT_PUBLIC_BICONOMY_UPLOAD_API_ID as string
        )
      }
    } else {
      alert("Please upload a file")
    }
  }

  return (
    <div className="w-full">
      <header className="h-24 flex items-center justify-center text-4xl">
        Upload a document
      </header>
      <div className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 flex flex-col gap-5 mx-auto">
        <Input
          id="title"
          label="Title"
          value={title}
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
        {responseBytes && (
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
          <Button onClick={uploadFile} disabled={loading}>
            {loading ? (
              <div className="flex gap-2">
                <div>
                  <div className="loader w-5 h-5"></div>
                </div>
                Uploading Document
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
      </div>
    </div>
  )
}
