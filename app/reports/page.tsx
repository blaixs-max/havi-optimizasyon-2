"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { BarChart3, TrendingUp, TrendingDown, Truck, MapPin, Fuel, Download, Calendar } from "lucide-react"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("week")
  const [stats, setStats] = useState({
    totalRoutes: 0,
    totalDistance: 0,
    totalCost: 0,
    totalFuelCost: 0,
    avgCostPerKm: 0,
    avgStopsPerRoute: 0,
    vehicleUtilization: 0,
    costSavings: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [dateRange])

  const fetchStats = async () => {
    if (!supabase) {
      setStats({
        totalRoutes: 47,
        totalDistance: 3250,
        totalCost: 45800,
        totalFuelCost: 18200,
        avgCostPerKm: 14.09,
        avgStopsPerRoute: 8.3,
        vehicleUtilization: 78.5,
        costSavings: 12.3,
      })
      return
    }

    try {
      const { data: routes } = await supabase.from("routes").select(`*, stops:route_stops(count)`)

      if (routes) {
        const totalRoutes = routes.length
        const totalDistance = routes.reduce((sum, r) => sum + (r.total_distance_km || 0), 0)
        const totalCost = routes.reduce((sum, r) => sum + (r.total_cost || 0), 0)
        const totalFuelCost = routes.reduce((sum, r) => sum + (r.fuel_cost || 0), 0)

        setStats({
          totalRoutes,
          totalDistance,
          totalCost,
          totalFuelCost,
          avgCostPerKm: totalDistance > 0 ? totalCost / totalDistance : 0,
          avgStopsPerRoute:
            totalRoutes > 0 ? routes.reduce((sum, r) => sum + (r.stops?.[0]?.count || 0), 0) / totalRoutes : 0,
          vehicleUtilization: 78.5,
          costSavings: 12.3,
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-y-auto bg-slate-50">
        {/* Header - Mobil responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-white gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Raporlar</h1>
            <p className="text-xs sm:text-sm text-slate-500">Performans metrikleri ve maliyet analizi</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 sm:w-40 bg-white text-sm">
                <Calendar className="w-4 h-4 mr-1 sm:mr-2 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Bugun</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
                <SelectItem value="year">Bu Yil</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-white text-sm">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Rapor Indir</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid - Mobilde 2x2 grid */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 truncate">Toplam Rota</p>
                    <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.totalRoutes}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-emerald-100 shrink-0">
                    <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 truncate">Mesafe</p>
                    <p className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">
                      {stats.totalDistance.toFixed(0)} km
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-blue-100 shrink-0">
                    <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 truncate">Maliyet</p>
                    <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1">
                      {stats.totalCost.toLocaleString("tr-TR")} TL
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-emerald-100 shrink-0">
                    <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500 truncate">Yakit</p>
                    <p className="text-lg sm:text-3xl font-bold text-slate-900 mt-1">
                      {stats.totalFuelCost.toLocaleString("tr-TR")} TL
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-amber-100 shrink-0">
                    <Fuel className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats - Mobilde stack */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-sm sm:text-base font-medium text-slate-900">Ort. Maliyet / KM</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="flex items-end gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    {stats.avgCostPerKm.toFixed(2)} TL
                  </span>
                  <span className="text-xs sm:text-sm text-emerald-600 flex items-center mb-1">
                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    -5.2%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-sm sm:text-base font-medium text-slate-900">Arac Kullanim</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="flex items-end gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.vehicleUtilization}%</span>
                  <span className="text-xs sm:text-sm text-emerald-600 flex items-center mb-1">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    +3.1%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${stats.vehicleUtilization}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-sm sm:text-base font-medium text-slate-900">Maliyet Tasarrufu</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="flex items-end gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.costSavings}%</span>
                  <span className="text-xs sm:text-sm text-slate-500 mb-1">optimizasyon ile</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Depot Performance */}
          <Card className="border-slate-200">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base text-slate-900">Depo Performansi</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="space-y-3 sm:space-y-4">
                {["Istanbul Depo", "Ankara Depo", "Izmir Depo"].map((depot, i) => (
                  <div key={depot} className="flex items-center gap-2 sm:gap-4">
                    <div className="w-24 sm:w-32 font-medium text-slate-700 text-xs sm:text-sm truncate">{depot}</div>
                    <div className="flex-1 h-3 sm:h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${[85, 72, 68][i]}%` }} />
                    </div>
                    <div className="w-10 sm:w-16 text-right text-xs sm:text-sm font-medium text-slate-900">
                      {[85, 72, 68][i]}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
