import Link from "next/link"
import GoogleSignIn from "./GoogleSignIn"
import DiscordSignIn from "./DiscordSignIn"

export default function Header({ isIssuer }: { isIssuer?: boolean }) {
  return (
    <header className="flex justify-between items-center py-12">
      <Link href={"/"} className="font-mono text-2xl">
        The Registry
      </Link>
      <div className="flex items-center gap-6">
        {isIssuer && (
          <>
            <Link href={"/issuer/issue"}>Issue Document</Link>
            <Link href={"/issuer/create"}>Create Profile</Link>
          </>
        )}
        {isIssuer ? <GoogleSignIn /> : <DiscordSignIn />}
      </div>
    </header>
  )
}
