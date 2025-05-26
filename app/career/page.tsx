import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function CareerPage() {
  return (
    <div className="container mx-auto py-10">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-gray-600">We are always looking for talented individuals to join our team.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Software Engineer</CardTitle>
              <CardDescription>Develop and maintain high-quality software.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Location: Remote</p>
              <p>Experience: 3+ years</p>
            </CardContent>
            <CardFooter>
              <Button>Apply Now</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI/UX Designer</CardTitle>
              <CardDescription>Create intuitive and engaging user interfaces.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Location: New York</p>
              <p>Experience: 2+ years</p>
            </CardContent>
            <CardFooter>
              <Button>Apply Now</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketing Manager</CardTitle>
              <CardDescription>Lead and execute marketing strategies.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Location: San Francisco</p>
              <p>Experience: 5+ years</p>
            </CardContent>
            <CardFooter>
              <Button>Apply Now</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">Submit Your Resume</h2>
        <Card>
          <CardHeader>
            <CardTitle>General Application</CardTitle>
            <CardDescription>Submit your resume for future opportunities.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" placeholder="Your Name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" placeholder="Your Email" />
                </div>
              </div>
              <div>
                <Label htmlFor="position">Desired Position</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineer">Software Engineer</SelectItem>
                    <SelectItem value="ui-ux-designer">UI/UX Designer</SelectItem>
                    <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resume">Resume</Label>
                <Input type="file" id="resume" />
              </div>
              <div>
                <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                <Textarea id="cover-letter" placeholder="Write your cover letter here..." />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button>Submit Application</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Have Questions or Want to Connect?</h2>
        <div className="space-x-4">
          <Button variant="outline" size="lg" asChild className="h-12 px-8">
            <Link href="mailto:contact@flavorstudios.in">
              <Mail className="mr-2 h-5 w-5" />
              Email Directly
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
