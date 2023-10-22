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
import { SessionSigs } from "@lit-protocol/types"
import { decryptEmail, encryptDocument } from "@/utils/lit"
import { Database, Statement } from "@tableland/sdk"
import { IRequest } from "@/issuer/requests/page"

const requestsTable: string = process.env
  .NEXT_PUBLIC_REQUESTS_TABLE_NAME as string // Our pre-defined health check table

export default function Issue() {
  const [isClient, setIsClient] = useState(false)
  const { pkpWallet, sessionSigs } = useContext<{
    pkpWallet?: PKPEthersWallet
    sessionSigs?: SessionSigs
  }>(WalletContext)

  const [cid, setCid] = useState<string>()
  const [file, setFile] = useState<File>()
  const [title, setTitle] = useState<string>("")
  const [request, setRequest] = useState<IRequest>()
  const { responseBytes, setResponse } = useSismo()
  const [email, setEmail] = useState<string>()
  const { submitWithPersonalSign, loading, setLoading, txHash } = useBiconomy()
  const db = new Database()

  useEffect(() => {
    getRequest()
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (request && pkpWallet && sessionSigs) {
      getEmail(request, sessionSigs, pkpWallet.address)
    }
  }, [request, pkpWallet, sessionSigs])

  const getEmail = async (
    request: IRequest,
    sessionSigs: SessionSigs,
    address: string
  ) => {
    const email = await decryptEmail(
      request.cipher,
      request.encryptedEmail,
      sessionSigs,
      address
    )
    setEmail(email)
  }

  const getRequest = () => {
    if (typeof window !== "undefined") {
      const request = JSON.parse(
        sessionStorage.getItem("request-details") as string
      )
      setRequest(request)
    }
  }

  async function uploadFile() {
    if (file && request && sessionSigs) {
      setLoading(true)
      const client = new Web3Storage({
        token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN as string,
      })

      const { ciphertext, dataToEncryptHash } = await encryptDocument(
        file,
        sessionSigs,
        request.userAddress
      )

      const cid = await client.put([new File([ciphertext], "test.txt")], {
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
          [responseBytes, title, cid, request.userAddress, dataToEncryptHash]
        )

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
        Issue a document
      </header>
      <div className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-2xl sm:p-6 md:p-8 flex flex-col gap-5 mx-auto">
        <div className="flex gap-2">
          You are about to issue a document to:{" "}
          <Link
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            href={`mailto:${email}`}
            passHref
            target="_blank"
          >
            {email}
          </Link>
        </div>
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
                vault: {
                  impersonate: ["twitter:MIT", "twitter:UniofOxford"],
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
        )}
        <div className="mx-auto">
          <Button onClick={uploadFile} disabled={loading}>
            {loading ? (
              <div className="flex gap-2">
                <div>
                  <div className="loader w-5 h-5"></div>
                </div>
                Issuing Document
              </div>
            ) : (
              "Issue Document"
            )}
          </Button>
        </div>
        {txHash && (
          <div className="text-center">
            Issued document successfully.
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
