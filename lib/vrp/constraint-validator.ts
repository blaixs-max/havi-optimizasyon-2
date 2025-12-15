// Rota kısıt doğrulama fonksiyonları

import type { Vehicle, Customer, Depot } from "@/types/database"

export interface RouteConstraintViolation {
  type: "time_window" | "capacity_weight" | "capacity_volume" | "capacity_pallet" | "work_hours" | "vehicle_type"
  severity: "error" | "warning"
  message: string
  stopIndex?: number
}

export interface ValidatedRoute {
  isValid: boolean
  violations: RouteConstraintViolation[]
  stops: any[]
  vehicle: Vehicle
  depot: Depot
}

// Zaman penceresi kontrolü
export function validateTimeWindows(
  stops: any[],
  depot: Depot,
  vehicle: Vehicle,
  customers: Customer[],
): RouteConstraintViolation[] {
  const violations: RouteConstraintViolation[] = []
  let currentTime = 0 // Dakika cinsinden

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    const customer = customers.find((c) => c.id === stop.customerId)

    if (!customer) continue

    // Müşterinin zaman penceresi var mı?
    if (customer.time_window_start && customer.time_window_end) {
      const [startHour, startMin] = customer.time_window_start.split(":").map(Number)
      const [endHour, endMin] = customer.time_window_end.split(":").map(Number)

      const windowStart = startHour * 60 + startMin
      const windowEnd = endHour * 60 + endMin

      // Varış zamanı
      const arrivalTime = stop.arrivalTime || currentTime

      if (arrivalTime < windowStart) {
        violations.push({
          type: "time_window",
          severity: "warning",
          message: `${customer.name} için erken varış (${Math.floor(arrivalTime / 60)}:${(arrivalTime % 60).toString().padStart(2, "0")}). Pencere: ${customer.time_window_start}-${customer.time_window_end}`,
          stopIndex: i,
        })
      } else if (arrivalTime > windowEnd) {
        violations.push({
          type: "time_window",
          severity: "error",
          message: `${customer.name} için geç varış (${Math.floor(arrivalTime / 60)}:${(arrivalTime % 60).toString().padStart(2, "0")}). Pencere: ${customer.time_window_start}-${customer.time_window_end}`,
          stopIndex: i,
        })
      }

      currentTime = Math.max(arrivalTime, windowStart) + (customer.service_duration || 15)
    } else {
      currentTime += stop.serviceTime || 15
    }
  }

  return violations
}

// Çok boyutlu kapasite kontrolü
export function validateCapacity(stops: any[], vehicle: Vehicle, customers: Customer[]): RouteConstraintViolation[] {
  const violations: RouteConstraintViolation[] = []

  let totalWeight = 0
  let totalVolume = 0
  let totalPallets = 0

  for (const stop of stops) {
    const customer = customers.find((c) => c.id === stop.customerId)
    if (!customer) continue

    totalWeight += customer.demand_kg || 0
    totalVolume += customer.demand_m3 || 0
    totalPallets += customer.demand_pallets || customer.demand_pallet || 1
  }

  // Ağırlık kontrolü
  if (vehicle.capacity_kg && totalWeight > vehicle.capacity_kg) {
    violations.push({
      type: "capacity_weight",
      severity: "error",
      message: `Ağırlık kapasitesi aşıldı: ${totalWeight}kg / ${vehicle.capacity_kg}kg`,
    })
  }

  // Hacim kontrolü
  if (vehicle.capacity_m3 && totalVolume > vehicle.capacity_m3) {
    violations.push({
      type: "capacity_volume",
      severity: "error",
      message: `Hacim kapasitesi aşıldı: ${totalVolume}m³ / ${vehicle.capacity_m3}m³`,
    })
  }

  // Palet kontrolü
  const palletCapacity = vehicle.capacity_pallet || vehicle.capacity_pallets || 12
  if (totalPallets > palletCapacity) {
    violations.push({
      type: "capacity_pallet",
      severity: "error",
      message: `Palet kapasitesi aşıldı: ${totalPallets} / ${palletCapacity}`,
    })
  }

  return violations
}

// Sürücü çalışma saati kontrolü
export function validateWorkHours(totalDuration: number, vehicle: Vehicle): RouteConstraintViolation[] {
  const violations: RouteConstraintViolation[] = []

  const maxWorkHours = vehicle.driver_max_work_hours || 11
  const maxWorkMinutes = maxWorkHours * 60

  if (totalDuration > maxWorkMinutes) {
    violations.push({
      type: "work_hours",
      severity: "error",
      message: `Sürücü çalışma saati aşıldı: ${Math.round(totalDuration / 60)}sa / ${maxWorkHours}sa`,
    })
  }

  return violations
}

// Araç tipi uygunluk kontrolü
export function validateVehicleType(stops: any[], vehicle: Vehicle, customers: Customer[]): RouteConstraintViolation[] {
  const violations: RouteConstraintViolation[] = []

  for (const stop of stops) {
    const customer = customers.find((c) => c.id === stop.customerId)
    if (!customer || !customer.required_vehicle_types) continue

    const requiredTypes = customer.required_vehicle_types
    const vehicleType = vehicle.vehicle_type || vehicle.type

    if (requiredTypes.length > 0 && !requiredTypes.includes(vehicleType)) {
      violations.push({
        type: "vehicle_type",
        severity: "error",
        message: `${customer.name} için uygun araç tipi değil. Gerekli: ${requiredTypes.join(", ")}, Mevcut: ${vehicleType}`,
        stopIndex: stops.indexOf(stop),
      })
    }
  }

  return violations
}

// Tüm kısıtları kontrol et
export function validateRoute(route: any, vehicle: Vehicle, depot: Depot, customers: Customer[]): ValidatedRoute {
  const violations: RouteConstraintViolation[] = []

  // Zaman penceresi kontrolü
  violations.push(...validateTimeWindows(route.stops, depot, vehicle, customers))

  // Kapasite kontrolü
  violations.push(...validateCapacity(route.stops, vehicle, customers))

  // Çalışma saati kontrolü
  violations.push(...validateWorkHours(route.totalDuration || 0, vehicle))

  // Araç tipi kontrolü
  violations.push(...validateVehicleType(route.stops, vehicle, customers))

  const hasErrors = violations.some((v) => v.severity === "error")

  return {
    isValid: !hasErrors,
    violations,
    stops: route.stops,
    vehicle,
    depot,
  }
}
