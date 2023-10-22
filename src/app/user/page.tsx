"use client"

import { Database } from "@tableland/sdk"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function User() {
  const tableName: string = process.env.NEXT_PUBLIC_ISSUERS_TABLE_NAME as string // Our pre-defined health check table

  const db = new Database()

  // Type is inferred due to `Database` instance definition.
  // Or, it can be identified in `prepare`.

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="text-center text-4xl font-mono mt-48">
        Please sign in to request/view documents
      </div>
    </div>
  )
}
