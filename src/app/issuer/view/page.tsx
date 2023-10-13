"use client"

import { Button } from "@ensdomains/thorin"
import { Database } from "@tableland/sdk"

export default function View() {
  // This table has schema: `counter INTEGER PRIMARY KEY`
  const tableName: string = "issuers_80001_7721" // Our pre-defined health check table

  const db = new Database()

  // Type is inferred due to `Database` instance definition.
  // Or, it can be identified in `prepare`.
  const getIssuers = async () => {
    const { results } = await db.prepare(`SELECT * FROM ${tableName};`).all()
    console.log(results)
  }

  return <Button onClick={getIssuers}>Get Issuers</Button>
}
