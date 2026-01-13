"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, Route, TrendingUp, TrendingDown, MapPin } from "lucide-react"
import { getMockStats } from "@/lib/mock-data"
import type { DashboardStats as StatsType } from "@/types/database"
import { cn } from "@/lib/utils"

export function DashboardStats() {
  const [stats, setStats] = useState<StatsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [depotsRes, vehiclesRes, customersRes] = await Promise.all([
          fetch("/api/depots"),
          fetch("/api/vehicles"),
          fetch("/api/customers"),
        ])

        const [depots, vehicles, customers] = await Promise.all([
          depotsRes.json(),
          vehiclesRes.json(),
          customersRes.json(),
        ])

        const availableVehicles = vehicles.filter((v: any) => v.status === "available").length
        const pendingCustomers = customers.filter((c: any) => c.status === "pending").length

        setStats({
          totalDepots: depots.length || 0,
          totalVehicles: vehicles.length || 0,
          availableVehicles,
          totalCustomers: customers.length || 0,
          pendingCustomers,
          totalRoutes: 0,
          todayRoutes: 0,
          totalDistance: 0,
          totalCost: 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        setStats(getMockStats())
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 w-20 bg-muted rounded mb-3" />
              <div className="h-7 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Toplam Sipariş",
      value: stats?.totalCustomers || 0,
      change: "+12%",
      changeType: "positive" as const,
      subtitle: `${stats?.pendingCustomers || 0} bekleyen`,
      icon: Package,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      title: "Aktif Araç",
      value: stats?.availableVehicles || 0,
      change: `/${stats?.totalVehicles || 0}`,
      changeType: "neutral" as const,
      subtitle: "Müsait araç",
      icon: Truck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Planlı Rota",
      value: stats?.totalRoutes || 0,
      change: "-3%",
      changeType: "negative" as const,
      subtitle: "Bugünkü rotalar",
      icon: Route,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
    },
    {
      title: "Toplam Mesafe",
      value: `${((stats?.totalDistance || 0) / 1000).toFixed(0)}K`,
      change: "km",
      changeType: "neutral" as const,
      subtitle: `₺${((stats?.totalCost || 0) / 1000).toFixed(1)}K maliyet`,
      icon: MapPin,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", stat.iconBg)}>
                    <Icon className={cn("h-4 w-4", stat.iconColor)} />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded",
                      stat.changeType === "positive" && "text-emerald-600 bg-emerald-500/10",
                      stat.changeType === "negative" && "text-red-600 bg-red-500/10",
                      stat.changeType === "neutral" && "text-muted-foreground bg-muted",
                    )}
                  >
                    {stat.changeType === "positive" && <TrendingUp className="h-3 w-3" />}
                    {stat.changeType === "negative" && <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
