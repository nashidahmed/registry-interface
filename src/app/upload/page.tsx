"use client"

import docissueAbi from "/public/abis/Docissue.json"

import { ethers } from "ethers"
import { FormEvent, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { writeContract } from "@wagmi/core"
import { Web3Storage } from "web3.storage"
import Input from "@/components/Input"
import Button from "@/components/Button"
import Lit from "@/utils/lit"

export default function Upload() {
  const { address } = useAccount()

  const [cid, setCid] = useState<string>()
  const [file, setFile] = useState<File>()
  const [title, setTitle] = useState<string>("")

  useEffect(() => {})

  async function uploadFile() {
    const client = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN as string,
    })

    const cid = await client.put([new File([file as File], "test")], {
      onRootCidReady: (localCid: string) => {
        setCid(localCid)
      },
      onStoredChunk: (bytes: any) =>
        console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`),
    })
  }

  async function test() {
    // Lit.authenticate(title)
  }

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
  //     abi: docissueAbi,
  //     functionName: "uploadDocument",
  //     args: [title, cid],
  //   })

  //   console.log(hash)
  // }

  // async function getPubKey() {
  //   await lit.encryptFile(title)
  // }

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
        <div className="mx-auto mt-8">
          <Button onClick={uploadFile}>Upload document</Button>
        </div>

        <div className="mx-auto mt-8">
          <Button onClick={test}>Test</Button>
        </div>
        <div className="mx-auto mt-8">
          <Button onClick={Lit.computeKey}>Computer Key</Button>
        </div>
      </div>
    </div>
  )
}
