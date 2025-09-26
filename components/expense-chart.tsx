"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Transaction } from "@/app/page"

interface ExpenseChartProps {
  transactions: Transaction[]
  timeFilter: string
}

export function ExpenseChart({ transactions, timeFilter }: ExpenseChartProps) {
  const getChartData = () => {
    if (timeFilter === "day") {
      // Group by hour for daily view
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        รายรับ: 0,
        รายจ่าย: 0,
      }))

      transactions.forEach((transaction) => {
        const hour = new Date(transaction.date).getHours()
        if (transaction.type === "income") {
          hourlyData[hour].รายรับ += transaction.amount
        } else {
          hourlyData[hour].รายจ่าย += transaction.amount
        }
      })

      return hourlyData.filter((data) => data.รายรับ > 0 || data.รายจ่าย > 0)
    }

    if (timeFilter === "month") {
      // Group by day for monthly view
      const dailyData: { [key: string]: { รายรับ: number; รายจ่าย: number } } = {}

      transactions.forEach((transaction) => {
        const day = new Date(transaction.date).getDate()
        const key = `${day}`

        if (!dailyData[key]) {
          dailyData[key] = { รายรับ: 0, รายจ่าย: 0 }
        }

        if (transaction.type === "income") {
          dailyData[key].รายรับ += transaction.amount
        } else {
          dailyData[key].รายจ่าย += transaction.amount
        }
      })

      return Object.entries(dailyData)
        .map(([day, data]) => ({
          time: `${day}`,
          ...data,
        }))
        .sort((a, b) => Number.parseInt(a.time) - Number.parseInt(b.time))
    }

    if (timeFilter === "year") {
      // Group by month for yearly view
      const monthlyData: { [key: string]: { รายรับ: number; รายจ่าย: number } } = {}
      const monthNames = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ]

      transactions.forEach((transaction) => {
        const month = new Date(transaction.date).getMonth()
        const key = monthNames[month]

        if (!monthlyData[key]) {
          monthlyData[key] = { รายรับ: 0, รายจ่าย: 0 }
        }

        if (transaction.type === "income") {
          monthlyData[key].รายรับ += transaction.amount
        } else {
          monthlyData[key].รายจ่าย += transaction.amount
        }
      })

      return monthNames
        .map((month) => ({
          time: month,
          รายรับ: monthlyData[month]?.รายรับ || 0,
          รายจ่าย: monthlyData[month]?.รายจ่าย || 0,
        }))
        .filter((data) => data.รายรับ > 0 || data.รายจ่าย > 0)
    }

    return []
  }

  const data = getChartData()

  const getTitle = () => {
    switch (timeFilter) {
      case "day":
        return "รายรับรายจ่ายรายชั่วโมง"
      case "month":
        return "รายรับรายจ่ายรายวัน"
      case "year":
        return "รายรับรายจ่ายรายเดือน"
      default:
        return "รายรับรายจ่าย"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>เปรียบเทียบรายรับและรายจ่าย</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`฿${value.toLocaleString()}`, ""]}
              labelFormatter={(label) => `เวลา: ${label}`}
            />
            <Legend />
            <Bar dataKey="รายรับ" fill="#10b981" />
            <Bar dataKey="รายจ่าย" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
