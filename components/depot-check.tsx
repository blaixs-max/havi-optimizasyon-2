"use client"

import React from "react"

import { useDepotStore } from "@/lib/depot-store"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export function DepotCheck({ children }: { children: React.ReactNode }) {
  const selectedDepotId = useDepotStore((state) => state.selectedDepotId)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If no depot selected and not already on select-depot page, redirect
    if (!selectedDepotId && pathname !== "/select-depot") {
      router.push("/select-depot")
    }
  }, [selectedDepotId, pathname, router])

  // If no depot selected, don't render children (will redirect)
  if (!selectedDepotId && pathname !== "/select-depot") {
    return null
  }

  return <>{children}</>
}
