"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Globe, FileText, Sparkles, Eye } from "lucide-react"
import { updatePageContent } from "../../actions"
import type { PageContent } from "@/lib/admin-store"

interface PageCustomizerProps {
  initialPages: PageContent[]
}

export function PageCustomizer({ initialPages }: PageCustomizerProps) {
  const [pages, setPages] = useState(initialPages)
  const [saving, setSaving] = useState<string | null>(null)

  const websitePages = [
    {
      id: "home",
      name: "Home Page",
      description: "Main landing page with hero section and key content",
      sections: [
        { id: "hero", name: "Hero Section", description: "Main banner with title and call-to-action" },
        { id: "stats", name: "Statistics", description: "YouTube subscribers, episodes, views, etc." },
        { id: "about", name: "About Section", description: "Brief introduction to Flavor Studios" },
        { id: "featured", name: "Featured Content", description: "Highlighted videos and blog posts" },
      ],
    },
    {
      id: "about",
      name: "About Page",
      description: "Company story and team information",
      sections: [
        { id: "hero", name: "Hero Section", description: "About page header" },
        { id: "story", name: "Our Story", description: "Company background and mission" },
        { id: "team", name: "Team Section", description: "Meet the creators" },
        { id: "values", name: "Values", description: "What we stand for" },
      ],
    },
    {
      id: "contact",
      name: "Contact Page",
      description: "Contact information and forms",
      sections: [
        { id: "hero", name: "Hero Section", description: "Contact page header" },
        { id: "form", name: "Contact Form", description: "Main contact form" },
        { id: "info", name: "Contact Info", description: "Address, email, social links" },
      ],
    },
    {
      id: "blog",
      name: "Blog Page",
      description: "Blog listing and featured posts",
      sections: [
        { id: "hero", name: "Hero Section", description: "Blog page header" },
        { id: "featured", name: "Featured Posts", description: "Highlighted blog content" },
        { id: "categories", name: "Categories", description: "Blog post categories" },
      ],
    },
    {
      id: "watch",
      name: "Watch Page",
      description: "Video content and episodes",
      sections: [
        { id: "hero", name: "Hero Section", description: "Watch page header" },
        { id: "featured", name: "Featured Videos", description: "Highlighted video content" },
        { id: "episodes", name: "Episodes", description: "Episode listings" },
      ],
    },
  ]

  const getPageContent = (page: string, section: string) => {
    return pages.find((pc) => pc.page === page && pc.section === section)?.content || {}
  }

  const handleSaveContent = async (page: string, section: string, formData: FormData) => {
    setSaving(`${page}-${section}`)

    const content: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      content[key] = value
    }

    await updatePageContent(page, section, content)
    setSaving(null)
    window.location.reload()
  }

  const ContentForm = ({ page, section }: { page: string; section: string }) => {
    const content = getPageContent(page, section)
    const isLoading = saving === `${page}-${section}`
    const sectionInfo = websitePages.find((p) => p.id === page)?.sections.find((s) => s.id === section)

    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                {sectionInfo?.name || section}
              </CardTitle>
              <CardDescription>{sectionInfo?.description}</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {Object.keys(content).length} fields
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form action={(formData) => handleSaveContent(page, section, formData)} className="space-y-6">
            {section === "hero" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Hero Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={content.title || ""}
                      placeholder="Welcome to Flavor Studios"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge Text</Label>
                    <Input
                      id="badge"
                      name="badge"
                      defaultValue={content.badge || ""}
                      placeholder="Independent Anime Studio"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    name="subtitle"
                    defaultValue={content.subtitle || ""}
                    placeholder="Your destination for original anime content..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">CTA Button Text</Label>
                    <Input
                      id="ctaText"
                      name="ctaText"
                      defaultValue={content.ctaText || ""}
                      placeholder="Watch Our Content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">CTA Button Link</Label>
                    <Input id="ctaLink" name="ctaLink" defaultValue={content.ctaLink || ""} placeholder="/watch" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Background Image URL</Label>
                  <Input
                    id="backgroundImage"
                    name="backgroundImage"
                    defaultValue={content.backgroundImage || ""}
                    placeholder="https://example.com/hero-bg.jpg"
                    type="url"
                  />
                </div>
              </div>
            )}

            {section === "stats" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["subscribers", "episodes", "views", "years"].map((stat) => (
                  <div key={stat} className="space-y-2">
                    <Label htmlFor={`${stat}Value`} className="capitalize">
                      {stat} Value
                    </Label>
                    <Input
                      id={`${stat}Value`}
                      name={`${stat}Value`}
                      defaultValue={content[`${stat}Value`] || ""}
                      placeholder={
                        stat === "subscribers" ? "500K+" : stat === "episodes" ? "50+" : stat === "views" ? "2M+" : "5"
                      }
                    />
                    <Label htmlFor={`${stat}Label`} className="capitalize">
                      {stat} Label
                    </Label>
                    <Input
                      id={`${stat}Label`}
                      name={`${stat}Label`}
                      defaultValue={content[`${stat}Label`] || ""}
                      placeholder={
                        stat === "subscribers"
                          ? "YouTube Subscribers"
                          : stat === "episodes"
                            ? "Original Episodes"
                            : stat === "views"
                              ? "Total Views"
                              : "Years Creating"
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {section === "about" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heading">Section Heading</Label>
                  <Input
                    id="heading"
                    name="heading"
                    defaultValue={content.heading || ""}
                    placeholder="Latest from Flavor Studios"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={content.description || ""}
                    placeholder="Stay updated with our newest anime content..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Section Image</Label>
                    <Input
                      id="image"
                      name="image"
                      defaultValue={content.image || ""}
                      placeholder="https://example.com/about-image.jpg"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Featured Video URL</Label>
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      defaultValue={content.videoUrl || ""}
                      placeholder="https://youtube.com/watch?v=..."
                      type="url"
                    />
                  </div>
                </div>
              </div>
            )}

            {section === "form" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heading">Form Heading</Label>
                  <Input id="heading" name="heading" defaultValue={content.heading || ""} placeholder="Get in Touch" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Form Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={content.description || ""}
                    placeholder="We'd love to hear from you..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="submitText">Submit Button Text</Label>
                    <Input
                      id="submitText"
                      name="submitText"
                      defaultValue={content.submitText || ""}
                      placeholder="Send Message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="successMessage">Success Message</Label>
                    <Input
                      id="successMessage"
                      name="successMessage"
                      defaultValue={content.successMessage || ""}
                      placeholder="Thank you for your message!"
                    />
                  </div>
                </div>
              </div>
            )}

            {section === "info" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      name="email"
                      defaultValue={content.email || ""}
                      placeholder="hello@flavorstudios.in"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" defaultValue={content.phone || ""} placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    defaultValue={content.address || ""}
                    placeholder="123 Creative Street, Animation City, AC 12345"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["youtube", "twitter", "instagram", "discord"].map((social) => (
                    <div key={social} className="space-y-2">
                      <Label htmlFor={social} className="capitalize">
                        {social} URL
                      </Label>
                      <Input
                        id={social}
                        name={social}
                        defaultValue={content[social] || ""}
                        placeholder={`https://${social}.com/flavorstudios`}
                        type="url"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => window.open(`/${page}`, "_blank")}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Page
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Page Customizer</h1>
        <p className="text-gray-600 mt-2">Edit content for your website pages</p>
      </div>

      {/* Page Tabs */}
      <Tabs defaultValue="home" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {websitePages.map((page) => (
            <TabsTrigger key={page.id} value={page.id} className="flex flex-col items-center p-3">
              <Globe className="w-4 h-4 mb-1" />
              <span className="text-xs">{page.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {websitePages.map((page) => (
          <TabsContent key={page.id} value={page.id} className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{page.name}</h2>
                    <p className="text-gray-600">{page.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/${page.id === "home" ? "" : page.id}`, "_blank")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Live
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {page.sections.map((section) => (
                <ContentForm key={section.id} page={page.id} section={section.id} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {pages.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No page content yet</h3>
            <p className="text-gray-600">Start customizing your pages by editing the sections above</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
