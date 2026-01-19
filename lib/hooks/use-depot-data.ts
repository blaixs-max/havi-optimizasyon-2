"use client"

import useSWR from "swr"
import { useDepotStore } from "@/lib/depot-store"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCustomers() {
  const selectedDepotId = useDepotStore((state) => state.selectedDepotId)
  const url = selectedDepotId ? `/api/customers?depot_id=${selectedDepotId}` : "/api/customers"
  return useSWR(url, fetcher)
}

export function useVehicles() {
  const selectedDepotId = useDepotStore((state) => state.selectedDepotId)
  const url = selectedDepotId ? `/api/vehicles?depot_id=${selectedDepotId}` : "/api/vehicles"
  return useSWR(url, fetcher)
}

export function useOrders() {
  const selectedDepotId = useDepotStore((state) => state.selectedDepotId)
  const url = selectedDepotId ? `/api/orders?depot_id=${selectedDepotId}` : "/api/orders"
  return useSWR(url, fetcher)
}

export function useDepots() {
  return useSWR("/api/depots", fetcher)
}
