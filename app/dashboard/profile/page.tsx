import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfileManagement() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Profile Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+1 234 567 8900" />
            </div>
            <div>
              <Label htmlFor="resume">Update Resume</Label>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" />
            </div>
            <Button type="submit" className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

