import { create } from "zustand"
import { persist } from "zustand/middleware"

interface DepotStore {
  selectedDepotId: string | null
  setSelectedDepot: (depotId: string) => void
  clearSelectedDepot: () => void
}

export const useDepotStore = create<DepotStore>()(
  persist(
    (set) => ({
      selectedDepotId: null,
      setSelectedDepot: (depotId) => set({ selectedDepotId: depotId }),
      clearSelectedDepot: () => set({ selectedDepotId: null }),
    }),
    {
      name: "depot-selection",
    }
  )
)

export const DEPOTS = [
  {
    id: "depot-1",
    name: "İstanbul Depo",
    city: "Istanbul",
    description: "Avrupa Yakası Merkez Depo",
  },
  {
    id: "depot-2",
    name: "Ankara Depo",
    city: "Ankara",
    description: "İç Anadolu Bölge Deposu",
  },
  {
    id: "depot-3",
    name: "İzmir Depo",
    city: "Izmir",
    description: "Ege Bölgesi Merkez Depo",
  },
] as const
