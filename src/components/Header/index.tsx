import Link from "next/link"

export default function Header() {
  return (
    <header className="flex justify-between items-center py-12">
      <Link href={"/"} className="font-mono text-2xl">
        Docissue
      </Link>
      <div className="flex items-center gap-4 font-mono">
        <Link href={"/upload"}>Upload Content</Link>
        <Link href={"/create/issuer"}>For Issuers</Link>
        <w3m-button />
      </div>
    </header>
  )
}
