"use client"

import docissueAbi from "@public/abis/Docissue.json"

import {
  Button,
  FileInput,
  VisuallyHidden,
  Card,
  Input,
  CloseSVG,
} from "@ensdomains/thorin"
import { ethers } from "ethers"
import { FormEvent, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { writeContract } from "@wagmi/core"
import { Web3Storage } from "web3.storage"

export default function Upload() {
  const { address } = useAccount()

  const [cid, setCid] = useState<string>()
  const [file, setFile] = useState<File>()
  const [title, setTitle] = useState<string>()

  useEffect(() => {})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // don't reload the page!
    event.preventDefault()
    console.log(`Uploading to Filecoin...`)

    const client = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN as string,
    })

    console.log(file)

    const cid = await client.put([file], {
      onRootCidReady: (localCid: string) => {
        setCid(localCid)
      },
      onStoredChunk: (bytes: any) =>
        console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`),
    })

    const { hash } = await writeContract({
      address: process.env
        .NEXT_PUBLIC_DOCISSUE_CONTRACT_ADDRESS as `0x${string}`,
      abi: docissueAbi,
      functionName: "uploadDocument",
      args: [title, cid],
    })

    console.log(hash)
  }

  return (
    <div className="px-96">
      <header className="text-center pt-4 pb-8 text-2xl">
        Upload a document
      </header>
      <Card>
        <Input
          label="Title"
          placeholder="Enter the document title"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          id="filepicker"
          name="fileList"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <div className="mx-auto">
          <Button className="w-fit" onClick={handleSubmit}>
            Upload document
          </Button>
        </div>
      </Card>
    </div>
  )
}
