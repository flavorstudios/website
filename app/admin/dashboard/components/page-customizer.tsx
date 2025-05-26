"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye, Globe, Sparkles } from "lucide-react"

interface PageContent {
  page: string
  section: string
  content: Record<string, any>
  updatedAt: string
}

export function PageCustomizer() {
  const [pageContent, setPageContent] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadPageContent()
  }, [])

  const loadPageContent = async () => {
    try {
      const response = await fetch("/api/admin/pages")
      const data = await response.json()
      setPageContent(data.pages || [])
    } catch (error) {
      console.error("Failed to load page content:", error)
    } finally {
      setLoading(false)
    }
  }

  const updatePageContent = async (page: string, section: string, content: Record<string, any>) => {
    setSaving(`${page}-${section}`)
    try {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, section, content }),
      })

      if (response.ok) {
        await loadPageContent()
      }
    } catch (error) {
      console.error("Failed to update page content:", error)
    } finally {
      setSaving(null)
    }
  }

  const getPageContent = (page: string, section: string) => {
    const content = pageContent.find((pc) => pc.page === page && pc.section === section)
    return content?.content || {}
  }

  const pages = [
    {
      id: "home",
      name: "Homepage",
      sections: [
        { id: "hero", name: "Hero Section", description: "Main banner with title and call-to-action" },
        { id: "stats", name: "Statistics", description: "YouTube subscribers, episodes, views, etc." },
        { id: "about", name: "About Section", description: "Brief introduction to Flavor Studios" },
      ],
    },
    {
      id: "about",
      name: "About Page",
      sections: [
        { id: "hero", name: "Hero Section", description: "About page header" },
        { id: "mission", name: "Mission Statement", description: "Company mission and values" },
        { id: "team", name: "Team Section", description: "Meet the creators" },
      ],
    },
    {
      id: "contact",
      name: "Contact Page",
      sections: [
        { id: "hero", name: "Hero Section", description: "Contact page header" },
        { id: "info", name: "Contact Information", description: "Address, email, social links" },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Page Customizer</h2>
          <p className="text-gray-600">Edit content for your website pages</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open("https://flavorstudios.in", "_blank")}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Live Site
        </Button>
      </div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {pages.map((page) => (
            <TabsTrigger key={page.id} value={page.id} className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {page.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {pages.map((page) => (
          <TabsContent key={page.id} value={page.id} className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">{page.name}</h3>
                    <p className="text-purple-700">Customize the content for your {page.name.toLowerCase()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(`https://flavorstudios.in/${page.id === "home" ? "" : page.id}`, "_blank")
                    }
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {page.sections.map((section) => (
                <PageSectionEditor
                  key={section.id}
                  page={page.id}
                  section={section}
                  content={getPageContent(page.id, section.id)}
                  onSave={(content) => updatePageContent(page.id, section.id, content)}
                  saving={saving === `${page.id}-${section.id}`}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function PageSectionEditor({
  page,
  section,
  content,
  onSave,
  saving,
}: {
  page: string
  section: { id: string; name: string; description: string }
  content: Record<string, any>
  onSave: (content: Record<string, any>) => void
  saving: boolean
}) {
  const [formData, setFormData] = useState(content)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {section.name}
        </CardTitle>
        <p className="text-gray-600">{section.description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {section.id === "hero" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Badge Text</label>
                  <Input
                    value={formData.badge || ""}
                    onChange={(e) => updateField("badge", e.target.value)}
                    placeholder="Independent Anime Studio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Main Title</label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Welcome to Flavor Studios"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Your destination for original anime content..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                  <Input
                    value={formData.ctaText || ""}
                    onChange={(e) => updateField("ctaText", e.target.value)}
                    placeholder="Watch Our Content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CTA Button Link</label>
                  <Input
                    value={formData.ctaLink || ""}
                    onChange={(e) => updateField("ctaLink", e.target.value)}
                    placeholder="/watch"
                  />
                </div>
              </div>
            </>
          )}

          {section.id === "stats" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["subscribers", "episodes", "views", "years"].map((stat) => (
                <div key={stat}>
                  <label className="block text-sm font-medium mb-2 capitalize">{stat}</label>
                  <Input
                    value={formData[stat] || ""}
                    onChange={(e) => updateField(stat, e.target.value)}
                    placeholder={
                      stat === "subscribers" ? "500K+" : stat === "episodes" ? "50+" : stat === "views" ? "2M+" : "5"
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {section.id === "about" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Latest from Flavor Studios"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Stay updated with our newest anime content..."
                  rows={4}
                />
              </div>
            </>
          )}

          {section.id === "mission" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Mission Statement</label>
                <Textarea
                  value={formData.mission || ""}
                  onChange={(e) => updateField("mission", e.target.value)}
                  placeholder="At Flavor Studios, we believe..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vision</label>
                <Textarea
                  value={formData.vision || ""}
                  onChange={(e) => updateField("vision", e.target.value)}
                  placeholder="Our vision is to..."
                  rows={3}
                />
              </div>
            </>
          )}

          {section.id === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={formData.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contact@flavorstudios.in"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <Textarea
                  value={formData.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="123 Creative Street, Animation City"
                  rows={2}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
