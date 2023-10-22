"use client"

import { Database } from "@tableland/sdk"
import { useState } from "react"

interface IDocument {
  id: number
  name: string
  website: string
  description: string
  twitter: string
  image: string
}

export default function View({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<IDocument>()
  const appId = "0x1002"
  const tableName: string = process.env.NEXT_PUBLIC_ISSUERS_TABLE_NAME as string // Our pre-defined health check table

  const db = new Database()

  const getDocument = async () => {
    const preparedStmt = db.prepare(`SELECT * FROM ${tableName} WHERE to = ?1`)

    const document: IDocument = await preparedStmt.bind(params.id).first()
    setDocument(document)
  }

  const getTwitterLink = (twitterId: string) => {
    let x = appId.length
    while (twitterId[x] == "0") x++

    return `https://twitter.com/i/user/${twitterId.slice(x)}`
  }
}
