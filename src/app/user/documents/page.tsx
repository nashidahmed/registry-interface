"use client"

import { Issuer } from "@/issuer/[id]/page"
import { WalletContext } from "@/layout"
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers"
import { Database, Statement } from "@tableland/sdk"
import { ethers } from "ethers"
import Link from "next/link"
import { SetStateAction, useContext, useEffect, useState } from "react"
import theRegistryAbi from "/public/abis/TheRegistry.json"
import { AuthMethod, SessionSigs } from "@lit-protocol/types"
import { encryptEmail } from "@/utils/lit"
import useBiconomy from "@/hooks/useBiconomy"
import { useRouter } from "next/navigation"

const documentsTable: string = process.env
  .NEXT_PUBLIC_DOCUMENTS_TABLE_NAME as string // Our pre-defined health check table

export interface IDocument {
  id: number
  receiver: string
  cid: string
  title: string
  twitter: string
  encryptData: string
}

export default function Documents() {
  const { pkpWallet, authMethod, sessionSigs } = useContext<{
    pkpWallet?: PKPEthersWallet
    authMethod?: AuthMethod
    sessionSigs?: SessionSigs
    setPkpWallet?: React.Dispatch<SetStateAction<PKPEthersWallet>>
  }>(WalletContext)
  const [documents, setDocuments] = useState<IDocument[]>()
  const [loading, setLoading] = useState<boolean>(true)
  const appId = "0x1002"
  const db = new Database()
  const router = useRouter()

  useEffect(() => {
    if (pkpWallet) {
      getDocuments()
    }
  }, [pkpWallet])

  const getDocuments = async () => {
    try {
      const preparedStmt: Statement = db.prepare(
        `SELECT * FROM ${documentsTable} WHERE receiver = ?`
      )

      const documents: IDocument[] = (
        await preparedStmt.bind(pkpWallet?.address.toLowerCase()).all()
      ).results as IDocument[]
      setDocuments(documents)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const getTwitterLink = (twitterId: string) => {
    let x = appId.length
    while (twitterId[x] == "0") x++

    return `https://twitter.com/i/user/${twitterId.slice(x)}`
  }

  return documents && documents.length !== 0 ? (
    <div className="w-full">
      <header className="h-24 flex items-center justify-center text-4xl">
        My Documents
      </header>
      <div className="max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow-2xl sm:p-6 md:p-8 flex flex-col gap-5 mx-auto">
        <table className="table-auto">
          <thead>
            <tr>
              <th>Title</th>
              <th>Issued by</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr className="text-center" key={document.id}>
                <td>{document.title}</td>
                <td>
                  <Link
                    href={getTwitterLink(document.twitter)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    passHref
                    target="_blank"
                  >
                    Link to Twitter
                  </Link>
                </td>
                <td>
                  <Link
                    href={`/user/document/${document.id}`}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
                  >
                    View document
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : loading ? (
    <div className="text-4xl flex justify-center mt-32 gap-4">
      Loading Documents
      <div>
        <div className="loader w-10 h-10"></div>
      </div>
    </div>
  ) : (
    <div className="text-4xl flex justify-center mt-32">No documents found</div>
  )
}
