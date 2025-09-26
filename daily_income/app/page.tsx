"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryChart } from "@/components/category-chart"

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

const CATEGORIES = {
  income: ["เงินเดือน", "ธุรกิจ", "การลงทุน", "อื่นๆ"],
  expense: ["อาหาร", "ที่อยู่อาศัย", "การเดินทาง", "สุขภาพ", "ความบันเทิง", "การศึกษา", "อื่นๆ"],
}

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [timeFilter, setTimeFilter] = useState("month")

  useEffect(() => {
    const saved = localStorage.getItem("transactions")
    if (saved) {
      setTransactions(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions([newTransaction, ...transactions])
    setShowForm(false)
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const getFilteredTransactions = () => {
    const now = new Date()
    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)

      switch (timeFilter) {
        case "day":
          return transactionDate.toDateString() === now.toDateString()
        case "month":
          return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()
        case "year":
          return transactionDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
    return filtered
  }

  const filteredTransactions = getFilteredTransactions()
  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "day":
        return "วันนี้"
      case "month":
        return "เดือนนี้"
      case "year":
        return "ปีนี้"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการรายรับรายจ่าย</h1>
            <p className="text-gray-600">ติดตามและวิเคราะห์การเงินของคุณ</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">วันนี้</SelectItem>
                <SelectItem value="month">เดือนนี้</SelectItem>
                <SelectItem value="year">ปีนี้</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มรายการ
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายรับ{getTimeFilterLabel()}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">฿{totalIncome.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายจ่าย{getTimeFilterLabel()}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">฿{totalExpense.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดคงเหลือ{getTimeFilterLabel()}</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ฿{balance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนรายการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="transactions">รายการทั้งหมด</TabsTrigger>
            <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpenseChart transactions={filteredTransactions} timeFilter={timeFilter} />
              <CategoryChart transactions={filteredTransactions} />
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <ExpenseList transactions={filteredTransactions} onDelete={deleteTransaction} categories={CATEGORIES} />
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">หมวดหมู่รายรับ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {CATEGORIES.income.map((category) => {
                      const amount = filteredTransactions
                        .filter((t) => t.type === "income" && t.category === category)
                        .reduce((sum, t) => sum + t.amount, 0)
                      return (
                        <div key={category} className="flex justify-between items-center">
                          <span>{category}</span>
                          <span className="font-semibold text-green-600">฿{amount.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">หมวดหมู่รายจ่าย</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {CATEGORIES.expense.map((category) => {
                      const amount = filteredTransactions
                        .filter((t) => t.type === "expense" && t.category === category)
                        .reduce((sum, t) => sum + t.amount, 0)
                      return (
                        <div key={category} className="flex justify-between items-center">
                          <span>{category}</span>
                          <span className="font-semibold text-red-600">฿{amount.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Modal */}
        {showForm && (
          <ExpenseForm onSubmit={addTransaction} onCancel={() => setShowForm(false)} categories={CATEGORIES} />
        )}
      </div>
    </div>
  )
}
