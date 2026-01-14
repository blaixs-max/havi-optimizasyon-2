"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash2, Package } from "lucide-react"
import * as XLSX from "xlsx"

type Order = {
  id: string
  customer_id: string
  customer_name: string
  city: string
  district: string
  order_date: string
  pallets: number
  status: string
  notes?: string
}

type Customer = {
  id: string
  name: string
}

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
  }, [])

  const fetchOrders = async () => {
    try {
      console.log("[v0] Fetching orders from /api/orders")
      const res = await fetch("/api/orders")
      const data = await res.json()
      console.log("[v0] Orders received:", data.length)
      console.log("[v0] First order:", data[0])
      console.log("[v0] Last order:", data[data.length - 1])
      setOrders(data)
    } catch (error) {
      console.error("[v0] Failed to fetch orders:", error)
      toast({ title: "Hata", description: "Siparişler yüklenemedi", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers")
      const data = await res.json()
      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      let successCount = 0
      let errorCount = 0

      for (const row of jsonData) {
        const customerName = row["Müşteri"] || row["Musteri"] || row["Customer"] || row["musteri"]
        const pallets = Number.parseInt(row["Palet"] || row["Pallets"] || row["palet"])

        if (!customerName || !pallets) {
          errorCount++
          continue
        }

        // Find customer by name (case-insensitive)
        const customer = customers.find((c) => c.name.toLowerCase().trim() === customerName.toLowerCase().trim())

        if (!customer) {
          errorCount++
          console.warn(`Customer not found: ${customerName}`)
          continue
        }

        try {
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer_id: customer.id,
              pallets,
              order_date: new Date().toISOString().split("T")[0],
            }),
          })
          successCount++
        } catch (err) {
          errorCount++
        }
      }

      toast({
        title: "Excel Yüklendi",
        description: `${successCount} sipariş eklendi, ${errorCount} hata`,
      })

      fetchOrders()
    } catch (error) {
      toast({ title: "Hata", description: "Excel dosyası okunamadı", variant: "destructive" })
    }

    // Reset input
    e.target.value = ""
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/orders?id=${id}`, { method: "DELETE" })
      toast({ description: "Sipariş silindi" })
      fetchOrders()
    } catch (error) {
      toast({ title: "Hata", description: "Sipariş silinemedi", variant: "destructive" })
    }
  }

  const totalPallets = orders.filter((o) => o.status === "pending").reduce((sum, o) => sum + o.pallets, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Siparişler</h1>
          <p className="text-muted-foreground">Müşteri siparişlerini yönetin</p>
        </div>
        <div className="flex gap-3">
          <label>
            <Input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="excel-upload" />
            <Button asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Excel Yükle
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bekleyen Sipariş</p>
              <p className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Package className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Palet</p>
              <p className="text-2xl font-bold">{totalPallets}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tamamlanan</p>
              <p className="text-2xl font-bold">{orders.filter((o) => o.status === "completed").length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sipariş Listesi</h2>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Yükleniyor...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Henüz sipariş yok</p>
              <p className="text-sm text-muted-foreground">Excel dosyası yükleyerek sipariş ekleyin</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Müşteri</th>
                    <th className="text-left p-3">Şehir</th>
                    <th className="text-left p-3">İlçe</th>
                    <th className="text-right p-3">Palet</th>
                    <th className="text-left p-3">Tarih</th>
                    <th className="text-left p-3">Durum</th>
                    <th className="text-right p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{order.customer_name}</td>
                      <td className="p-3">{order.city}</td>
                      <td className="p-3">{order.district}</td>
                      <td className="p-3 text-right font-semibold">{order.pallets}</td>
                      <td className="p-3">{new Date(order.order_date).toLocaleDateString("tr-TR")}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : order.status === "assigned"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-green-500/10 text-green-500"
                          }`}
                        >
                          {order.status === "pending"
                            ? "Bekliyor"
                            : order.status === "assigned"
                              ? "Atandı"
                              : "Tamamlandı"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
