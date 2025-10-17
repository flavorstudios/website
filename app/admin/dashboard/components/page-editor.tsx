"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Save, FileText, Smartphone, Monitor } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"

interface PageData {
  id: string
  title: string
  slug: string
  content: string
  metaDescription: string
  status: "published" | "draft" | "scheduled"
  lastModified: string
}

const samplePages: PageData[] = [
  {
    id: "1",
    title: "Home Page",
    slug: "/",
    content: "Welcome to Flavor Studios - where creativity meets technology...",
    metaDescription: "Flavor Studios - Professional video production and creative services",
    status: "published",
    lastModified: "2024-01-15",
  },
  {
    id: "2",
    title: "About Us",
    slug: "/about",
    content: "Our story began with a passion for storytelling...",
    metaDescription: "Learn about Flavor Studios team and our mission",
    status: "published",
    lastModified: "2024-01-14",
  },
  {
    id: "3",
    title: "Services",
    slug: "/services",
    content: "We offer comprehensive video production services...",
    metaDescription: "Professional video production services by Flavor Studios",
    status: "draft",
    lastModified: "2024-01-13",
  },
]

export function PageEditor() {
  const [selectedPage, setSelectedPage] = useState<PageData | null>(samplePages[0])
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  // Removed: const [isEditing, setIsEditing] = useState(false) // Unused as per lint

  const handleSave = () => {
    // Save logic would go here
    // setIsEditing(false) // Removed as per lint
    console.log("Page saved:", selectedPage)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <PageHeader
          level={2}
          className="mb-0"
          containerClassName="flex-col"
          title="Page Editor"
          description="Edit and manage your website pages"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Pages</CardTitle>
            <CardDescription>Select a page to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {samplePages.map((page) => (
              <div
                key={page.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPage?.id === page.id ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedPage(page)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{page.title}</h4>
                  <Badge className={getStatusColor(page.status)}>{page.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{page.slug}</p>
                <p className="text-xs text-muted-foreground mt-1">Modified: {page.lastModified}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedPage?.title || "Select a page"}</CardTitle>
                <CardDescription>{selectedPage?.slug}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                  className={previewMode === "desktop" ? "bg-purple-50" : ""}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode("tablet")}
                  className={previewMode === "tablet" ? "bg-purple-50" : ""}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                  className={previewMode === "mobile" ? "bg-purple-50" : ""}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedPage ? (
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="flex flex-wrap w-full gap-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Page Title</Label>
                      <Input
                        id="title"
                        value={selectedPage.title}
                        onChange={(e) =>
                          setSelectedPage({
                            ...selectedPage,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={selectedPage.slug}
                        onChange={(e) =>
                          setSelectedPage({
                            ...selectedPage,
                            slug: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        rows={12}
                        value={selectedPage.content}
                        onChange={(e) =>
                          setSelectedPage({
                            ...selectedPage,
                            content: e.target.value,
                          })
                        }
                        className="font-mono"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="meta-description">Meta Description</Label>
                      <Textarea
                        id="meta-description"
                        rows={3}
                        value={selectedPage.metaDescription}
                        onChange={(e) =>
                          setSelectedPage({
                            ...selectedPage,
                            metaDescription: e.target.value,
                          })
                        }
                        placeholder="Brief description for search engines..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedPage.metaDescription.length}/160 characters
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="keywords">Keywords</Label>
                      <Input id="keywords" placeholder="video production, creative services, flavor studios" />
                    </div>
                    <div>
                      <Label htmlFor="og-title">Open Graph Title</Label>
                      <Input id="og-title" value={selectedPage.title} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Page Status</Label>
                      <Select value={selectedPage.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template">Page Template</Label>
                      <Select defaultValue="default">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="landing">Landing Page</SelectItem>
                          <SelectItem value="blog">Blog Layout</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="featured" />
                      <Label htmlFor="featured">Featured Page</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="comments" />
                      <Label htmlFor="comments">Allow Comments</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No page selected</h3>
                <p className="text-muted-foreground">Select a page from the list to start editing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
