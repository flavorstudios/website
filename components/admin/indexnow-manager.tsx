"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIndexNow } from "@/hooks/use-indexnow"

/**
 * Admin component for managing IndexNow notifications
 * This can be used in an admin dashboard to manually trigger notifications
 */
export function IndexNowManager() {
  const [singleUrl, setSingleUrl] = useState("")
  const [batchUrls, setBatchUrls] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const { notify, notifyBatch, isNotifying } = useIndexNow({
    onSuccess: (url) => {
      setStatus("success")
      setMessage(`Successfully notified search engines`)
      setTimeout(() => setStatus("idle"), 3000)
    },
    onError: (err) => {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Failed to notify search engines")
      setTimeout(() => setStatus("idle"), 3000)
    },
  })

  const handleSingleNotify = async () => {
    if (!singleUrl) return
    await notify(singleUrl)
  }

  const handleBatchNotify = async () => {
    if (!batchUrls) return
    const urls = batchUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
    await notifyBatch(urls)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>IndexNow Manager</CardTitle>
        <CardDescription>Notify search engines about new or updated content on your website</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="single">
          <TabsList className="mb-4">
            <TabsTrigger value="single">Single URL</TabsTrigger>
            <TabsTrigger value="batch">Batch URLs</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="single-url" className="text-sm font-medium">
                  URL to notify
                </label>
                <Input
                  id="single-url"
                  placeholder="/blog/my-new-post or https://flavorstudios.in/blog/my-new-post"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                />
              </div>

              <Button onClick={handleSingleNotify} disabled={!singleUrl || isNotifying}>
                {isNotifying ? "Notifying..." : "Notify Search Engines"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="batch-urls" className="text-sm font-medium">
                  URLs to notify (one per line)
                </label>
                <textarea
                  id="batch-urls"
                  className="w-full min-h-[150px] p-2 border rounded-md"
                  placeholder="/blog/post-1
/blog/post-2
/watch/episode-3"
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                />
              </div>

              <Button onClick={handleBatchNotify} disabled={!batchUrls || isNotifying}>
                {isNotifying ? "Notifying..." : "Notify Search Engines (Batch)"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {status === "success" && <p className="text-sm text-green-500 mt-4">{message}</p>}

        {status === "error" && <p className="text-sm text-red-500 mt-4">{message}</p>}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        IndexNow helps search engines discover and index your content faster.
      </CardFooter>
    </Card>
  )
}
