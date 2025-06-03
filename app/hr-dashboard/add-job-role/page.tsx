"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { addJobRole, getAllJobRoles, updateJobRole, type JobRole } from "@/lib/job-role-service"
import { Loader2, Pencil } from "lucide-react"

// Question types that can be associated with job roles
const questionTypes = [
  { id: "technical", label: "Technical" },
  { id: "behavioral", label: "Behavioral" },
  { id: "situational", label: "Situational" },
  { id: "problem-solving", label: "Problem Solving" },
  { id: "communication", label: "Communication" },
  { id: "leadership", label: "Leadership" },
  { id: "teamwork", label: "Teamwork" },
  { id: "project-management", label: "Project Management" },
]

export default function AddJobRole() {
  const [jobRole, setJobRole] = useState<JobRole>({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    salary: "",
    location: "",
    questionTypes: [],
  })
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([])
  const [existingJobRoles, setExistingJobRoles] = useState<JobRole[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingJobRoles, setIsLoadingJobRoles] = useState(true)
  const [editingJobRole, setEditingJobRole] = useState<JobRole | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch existing job roles
  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const roles = await getAllJobRoles()
        setExistingJobRoles(roles)
        setIsLoadingJobRoles(false)
      } catch (error) {
        console.error("Error fetching job roles:", error)
        toast({
          title: "Error",
          description: "Failed to fetch job roles. Please try again.",
          variant: "destructive",
        })
        setIsLoadingJobRoles(false)
      }
    }

    fetchJobRoles()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJobRole((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    setSelectedQuestionTypes((prev) => {
      if (checked) {
        return [...prev, type]
      } else {
        return prev.filter((t) => t !== type)
      }
    })
  }

  const handleSelectJobRole = (roleId: string) => {
    const selected = existingJobRoles.find((role) => role.id === roleId)
    if (selected) {
      setJobRole(selected)
      setSelectedQuestionTypes(selected.questionTypes || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await addJobRole({
        ...jobRole,
        questionTypes: selectedQuestionTypes,
      })
      toast({
        title: "Success",
        description: "Job role added successfully",
      })
      setJobRole({
        title: "",
        description: "",
        requirements: "",
        responsibilities: "",
        salary: "",
        location: "",
        questionTypes: [],
      })
      setSelectedQuestionTypes([])

      // Refresh job roles list
      const roles = await getAllJobRoles()
      setExistingJobRoles(roles)
    } catch (error) {
      console.error("Error adding job role:", error)
      toast({
        title: "Error",
        description: "Failed to add job role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditJobRole = (role: JobRole) => {
    setEditingJobRole(role)
    setIsEditDialogOpen(true)
  }

  const handleUpdateJobRole = async () => {
    if (!editingJobRole || !editingJobRole.id) return

    try {
      await updateJobRole(editingJobRole.id, editingJobRole)
      toast({
        title: "Success",
        description: "Job role updated successfully",
      })

      // Refresh job roles list
      const roles = await getAllJobRoles()
      setExistingJobRoles(roles)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating job role:", error)
      toast({
        title: "Error",
        description: "Failed to update job role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditingJobRole((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleEditQuestionTypeChange = (type: string, checked: boolean) => {
    setEditingJobRole((prev) => {
      if (!prev) return null

      const currentTypes = prev.questionTypes || []
      let newTypes: string[]

      if (checked) {
        newTypes = [...currentTypes, type]
      } else {
        newTypes = currentTypes.filter((t) => t !== type)
      }

      return { ...prev, questionTypes: newTypes }
    })
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Job Roles Management</h2>

      <Tabs defaultValue="add">
        <TabsList className="mb-4">
          <TabsTrigger value="add">Add New Job Role</TabsTrigger>
          <TabsTrigger value="existing">Existing Job Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Job Role Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="existingRole">Select Existing Job Role (Optional)</Label>
                  <Select onValueChange={handleSelectJobRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an existing job role" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingJobRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id || ""}>
                          {role.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can select an existing job role to pre-fill the form
                  </p>
                </div>

                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" name="title" value={jobRole.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={jobRole.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={jobRole.requirements}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={jobRole.responsibilities}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input id="salary" name="salary" value={jobRole.salary} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={jobRole.location} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label>Question Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {questionTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`question-type-${type.id}`}
                          checked={selectedQuestionTypes.includes(type.id)}
                          onCheckedChange={(checked) => handleQuestionTypeChange(type.id, checked === true)}
                        />
                        <Label htmlFor={`question-type-${type.id}`}>{type.label}</Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the types of questions that should be associated with this job role
                  </p>
                </div>

                <Button type="submit" className="w-full bg-[#19A5A2] hover:bg-[#19A5A2]/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Job Role...
                    </>
                  ) : (
                    "Add Job Role"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle>Existing Job Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingJobRoles ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#19A5A2]" />
                </div>
              ) : existingJobRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No job roles found. Add your first job role.
                </div>
              ) : (
                <div className="space-y-4">
                  {existingJobRoles.map((role) => (
                    <Card key={role.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{role.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {role.location} • {role.salary}
                          </p>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => handleEditJobRole(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Question Types:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.questionTypes && role.questionTypes.length > 0 ? (
                            role.questionTypes.map((type) => (
                              <span
                                key={type}
                                className="text-xs bg-[#19A5A2]/10 text-[#19A5A2] px-2 py-1 rounded-full"
                              >
                                {questionTypes.find((t) => t.id === type)?.label || type}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No question types selected</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Job Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job Role</DialogTitle>
            <DialogDescription>Make changes to the job role details and question types.</DialogDescription>
          </DialogHeader>

          {editingJobRole && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Job Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={editingJobRole.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Job Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editingJobRole.description}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-requirements">Requirements</Label>
                <Textarea
                  id="edit-requirements"
                  name="requirements"
                  value={editingJobRole.requirements}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-responsibilities">Responsibilities</Label>
                <Textarea
                  id="edit-responsibilities"
                  name="responsibilities"
                  value={editingJobRole.responsibilities}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-salary">Salary Range</Label>
                <Input
                  id="edit-salary"
                  name="salary"
                  value={editingJobRole.salary}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={editingJobRole.location}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div>
                <Label>Question Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {questionTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-question-type-${type.id}`}
                        checked={(editingJobRole.questionTypes || []).includes(type.id)}
                        onCheckedChange={(checked) => handleEditQuestionTypeChange(type.id, checked === true)}
                      />
                      <Label htmlFor={`edit-question-type-${type.id}`}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleUpdateJobRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

