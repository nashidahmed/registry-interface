"use client"

import { WalletContext } from "@/layout"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { AuthMethod, SessionSigs } from "@lit-protocol/types"
import { Database, Statement } from "@tableland/sdk"
import { SetStateAction, useContext, useEffect, useState } from "react"
import { IDocument } from "../../documents/page"
import { decryptDocument } from "@/utils/lit"
import { Web3Storage } from "web3.storage"
import { pdfjs, Document, Page } from "react-pdf"
import type { PDFDocumentProxy } from "pdfjs-dist"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const documentsTable: string = process.env
  .NEXT_PUBLIC_DOCUMENTS_TABLE_NAME as string // Our pre-defined health check table

export default function View({ params }: { params: { id: string } }) {
  const { pkpWallet, authMethod, sessionSigs } = useContext<{
    pkpWallet?: PKPEthersWallet
    authMethod?: AuthMethod
    sessionSigs?: SessionSigs
    setPkpWallet?: React.Dispatch<SetStateAction<PKPEthersWallet>>
  }>(WalletContext)
  const [document, setDocument] = useState<IDocument>()
  const [url, setUrl] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error>()
  const db = new Database()

  useEffect(() => {
    if (sessionSigs && pkpWallet) {
      getDocument()
    }
  }, [pkpWallet])

  const getDocument = async () => {
    try {
      const preparedStmt: Statement = db.prepare(
        `SELECT * FROM ${documentsTable} WHERE id = ?`
      )

      const document: IDocument = (await preparedStmt
        .bind(params.id)
        .first()) as IDocument

      const client = new Web3Storage({
        token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN as string,
      })

      const res = await client.get(document.cid)
      if (res) {
        let decryptedData

        if (!res.ok) {
          throw new Error(`failed to get ${document.cid}`)
        }

        // unpack File objects from the response
        const files = await res.files()
        const reader = new FileReader()
        reader.onload = async (e) => {
          const text = e.target?.result as string
          decryptedData = await decryptDocument(
            text,
            document.encryptData,
            sessionSigs as SessionSigs,
            pkpWallet?.address as string
          )

          const url = URL.createObjectURL(
            new Blob([decryptedData], { type: "application/pdf" } /* (1) */)
          )

          setUrl(url)
        }
        reader.readAsText(files[0])

        // setUrl(url)
      }

      setDocument(document)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return url ? (
    <iframe
      src={url} // Use the Blob URL as the source
      title="PDF Viewer"
      width="1000px"
      height="750px"
    />
  ) : loading || !error ? (
    <div className="text-4xl flex justify-center mt-32 gap-4">
      Loading Document
      <div>
        <div className="loader w-10 h-10"></div>
      </div>
    </div>
  ) : (
    <div className="text-4xl flex justify-center mt-32">
      You are not authorized to view this document
    </div>
  )
}
