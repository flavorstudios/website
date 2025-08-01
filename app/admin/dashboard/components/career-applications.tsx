"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Submission {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  skills?: string
  portfolio?: string
  message?: string
  reviewed?: boolean
  createdAt?: string
}

export default function CareerApplications() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetch("/api/admin/career-submissions")
      .then(res => res.json())
      .then(data => setSubmissions(data.submissions || []))
      .catch(() => setSubmissions([]))
  }, [])

  const markReviewed = async (id: string) => {
    await fetch(`/api/admin/career-submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed: true })
    })
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, reviewed: true } : s))
  }

  const filtered = submissions.filter(s => {
    const matchSearch =
      s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "all" || (filter === "reviewed" ? s.reviewed : !s.reviewed)
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-bold">Career Applications</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Skills</th>
                <th className="p-3 text-left">Submitted</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0">
                  <td className="p-3 whitespace-nowrap">{s.firstName} {s.lastName}</td>
                  <td className="p-3 whitespace-nowrap">{s.email}</td>
                  <td className="p-3 whitespace-nowrap">{s.skills}</td>
                  <td className="p-3 whitespace-nowrap">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</td>
                  <td className="p-3 whitespace-nowrap">
                    {s.reviewed ? (
                      <Badge className="bg-green-100 text-green-700">Reviewed</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {!s.reviewed && (
                      <Button size="sm" onClick={() => markReviewed(s.id)}>
                        Mark as Reviewed
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>No submissions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}