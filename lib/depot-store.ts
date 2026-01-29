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
      selectedDepotId: "depot-2", // Default to Ankara Depo where all customers are
      setSelectedDepot: (depotId) => set({ selectedDepotId: depotId }),
      clearSelectedDepot: () => set({ selectedDepotId: null }),
    }),
    {
      name: "depot-selection",
      version: 2, // Increment version to trigger migration
      migrate: (persistedState: any, version: number) => {
        // If old version or depot-3 selected, reset to depot-2
        if (version < 2 || persistedState?.selectedDepotId === "depot-3") {
          console.log("[v0] Migrating depot selection from", persistedState?.selectedDepotId, "to depot-2")
          return {
            ...persistedState,
            selectedDepotId: "depot-2",
          }
        }
        return persistedState
      },
    }
  )
)
