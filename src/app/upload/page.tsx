"use client"

import { ethers } from "ethers"
import { FormEvent, useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Web3Storage } from "web3.storage"

export default function Upload() {
  const { address } = useAccount()

  const [cid, setCid] = useState<string>()
  const [file, setFile] = useState<File>()
  const [title, setTitle] = useState<string>()
  const [desc, setDesc] = useState<string>()

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
  }

  return (
    <form id="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="desc">Description</label>
      <input type="text" id="desc" onChange={(e) => setDesc(e.target.value)} />
      <label htmlFor="filepicker">Pick files to store</label>
      <br />
      <br />
      <input
        type="file"
        id="filepicker"
        name="fileList"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <input type="submit" value="Upload" id="submit" />
    </form>
  )
}
