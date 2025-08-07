"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

interface AuditLog {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  [key: string]: unknown
}

export function AuditLogViewer() {
  const [uid, setUid] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchLogs() {
    if (!uid) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/audit-logs/${uid}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch logs")
      setLogs(data.logs || [])
    } catch (e: any) {
      setError(e.message)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  function exportCsv() {
    const header = ["id", "actor", "action", "target", "timestamp"]
    const rows = filteredLogs.map(l => [l.id, l.actor, l.action, l.target, l.timestamp])
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${uid || "all"}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter(log => {
    const ts = new Date(log.timestamp)
    if (startDate && ts < new Date(startDate)) return false
    if (endDate && ts > new Date(endDate)) return false
    if (actionFilter && !log.action.includes(actionFilter)) return false
    return true
  })

  return (
    <div>
      <form
        className="flex flex-wrap gap-2 mb-4"
        onSubmit={e => {
          e.preventDefault()
          fetchLogs()
        }}
      >
        <Input
          placeholder="User ID"
          value={uid}
          onChange={e => setUid(e.target.value)}
          className="w-40"
        />
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <Input
          placeholder="Action"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="w-32"
        />
        <Button type="submit" disabled={loading}>
          Fetch
        </Button>
        {filteredLogs.length > 0 && (
          <Button type="button" variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
        )}
      </form>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.actor}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.target}</TableCell>
                <TableCell>
                  {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}