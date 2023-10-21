"use client"

import Header from "@/components/Header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-24 pb-10">
      <Header />
      <main className="flex items-center justify-center">{children}</main>
    </div>
  )
}
