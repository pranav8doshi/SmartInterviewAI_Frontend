"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Trash2, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAllQuestions, type InterviewQuestion, deleteQuestion } from "@/lib/question-bank-service"
import { getAllJobRoles, type JobRole } from "@/lib/job-role-service"

export default function QuestionBankLibrary() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<InterviewQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [jobRoleFilter, setJobRoleFilter] = useState("all")
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all")
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [questionTypes, setQuestionTypes] = useState<{ id: string; label: string }[]>([])
  const { toast } = useToast()

  // Define question types
  const allQuestionTypes = [
    { id: "technical", label: "Technical" },
    { id: "behavioral", label: "Behavioral" },
    { id: "situational", label: "Situational" },
    { id: "problem-solving", label: "Problem Solving" },
    { id: "communication", label: "Communication" },
    { id: "leadership", label: "Leadership" },
    { id: "teamwork", label: "Teamwork" },
    { id: "project-management", label: "Project Management" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedQuestions, fetchedJobRoles] = await Promise.all([getAllQuestions(), getAllJobRoles()])

        setQuestions(fetchedQuestions)
        setFilteredQuestions(fetchedQuestions)
        setJobRoles(fetchedJobRoles)

        // Extract all unique question types from job roles
        const types = new Set<string>()
        fetchedJobRoles.forEach((role) => {
          if (role.questionTypes) {
            role.questionTypes.forEach((type) => types.add(type))
          }
        })

        // Map to the full question type objects
        const uniqueTypes = Array.from(types).map((typeId) => {
          const found = allQuestionTypes.find((t) => t.id === typeId)
          return found || { id: typeId, label: typeId }
        })

        setQuestionTypes(uniqueTypes)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching questions:", error)
        toast({
          title: "Error",
          description: "Failed to load questions. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    // Apply filters
    let filtered = [...questions]

    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.expectedAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q.skillTags && q.skillTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((q) => q.category === categoryFilter)
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter)
    }

    if (jobRoleFilter !== "all") {
      filtered = filtered.filter((q) => q.jobRole === jobRoleFilter)
    }

    if (questionTypeFilter !== "all") {
      // Find job roles that have this question type
      const relevantJobRoles = jobRoles
        .filter((role) => role.questionTypes?.includes(questionTypeFilter))
        .map((role) => role.title)

      // Filter questions by those job roles
      filtered = filtered.filter((q) => relevantJobRoles.includes(q.jobRole))
    }

    setFilteredQuestions(filtered)
  }, [questions, searchQuery, categoryFilter, difficultyFilter, jobRoleFilter, questionTypeFilter, jobRoles])

  const handleViewQuestion = (question: InterviewQuestion) => {
    setSelectedQuestion(question)
    setIsViewDialogOpen(true)
  }

  const handleDeleteQuestion = (question: InterviewQuestion) => {
    setSelectedQuestion(question)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedQuestion || !selectedQuestion.id) return

    try {
      await deleteQuestion(selectedQuestion.id)
      setQuestions(questions.filter((q) => q.id !== selectedQuestion.id))
      toast({
        title: "Success",
        description: "Question deleted successfully",
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting question:", error)
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Question Bank Library</h2>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="situational">Situational</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jobRoleFilter} onValueChange={setJobRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Roles</SelectItem>
                {jobRoles.map((role) => (
                  <SelectItem key={role.id} value={role.title}>
                    {role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={questionTypeFilter} onValueChange={setQuestionTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Question Types</SelectItem>
                {allQuestionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#19A5A2]" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions found. Try adjusting your filters or add new questions.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-xs truncate">{question.question}</TableCell>
                      <TableCell>{question.jobRole}</TableCell>
                      <TableCell>{question.category}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            question.difficulty === "easy"
                              ? "bg-green-500"
                              : question.difficulty === "medium"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {question.skillTags?.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewQuestion(question)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Question Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Question:</h3>
                <p className="mt-1">{selectedQuestion.question}</p>
              </div>
              <div>
                <h3 className="font-medium">Expected Answer:</h3>
                <p className="mt-1">{selectedQuestion.expectedAnswer}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Job Role:</h3>
                  <p className="mt-1">{selectedQuestion.jobRole}</p>
                </div>
                <div>
                  <h3 className="font-medium">Category:</h3>
                  <p className="mt-1">{selectedQuestion.category}</p>
                </div>
                <div>
                  <h3 className="font-medium">Difficulty:</h3>
                  <p className="mt-1">{selectedQuestion.difficulty}</p>
                </div>
                <div>
                  <h3 className="font-medium">Source:</h3>
                  <p className="mt-1">{selectedQuestion.source || "Unknown"}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Skills:</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedQuestion.skillTags?.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

