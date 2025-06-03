"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { InterviewQuestionGenerator } from "@/lib/news-question-generator"
import { addQuestion, type InterviewQuestion } from "@/lib/question-bank-service"
import { getAllJobRoles } from "@/lib/job-role-service"

// Skills data
const skillsData = [
  { id: "javascript", label: "JavaScript" },
  { id: "react", label: "React" },
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "sql", label: "SQL" },
  { id: "mongodb", label: "MongoDB" },
  { id: "aws", label: "AWS" },
  { id: "docker", label: "Docker" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "devops", label: "DevOps" },
  { id: "agile", label: "Agile" },
  { id: "scrum", label: "Scrum" },
  { id: "leadership", label: "Leadership" },
  { id: "communication", label: "Communication" },
  { id: "problemsolving", label: "Problem Solving" },
  { id: "teamwork", label: "Teamwork" },
]

export default function AIGeneration() {
  const [activeTab, setActiveTab] = useState("standard")
  const [jobRoles, setJobRoles] = useState<{ id?: string; title: string }[]>([])
  const [selectedJobRole, setSelectedJobRole] = useState("")
  const [complexity, setComplexity] = useState([50])
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[]>([])
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const roles = await getAllJobRoles()
        setJobRoles(roles)
        if (roles.length > 0) {
          setSelectedJobRole(roles[0].title)
        }
      } catch (error) {
        console.error("Error fetching job roles:", error)
        toast({
          title: "Error",
          description: "Failed to fetch job roles. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchJobRoles()

    // Check for API keys
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const newsApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY

    if (!geminiKey || !newsApiKey) {
      toast({
        title: "Warning",
        description: "API keys are missing. Some features may not work properly.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleSkillChange = (skillId: string, checked: boolean) => {
    if (checked) {
      setSelectedSkills([...selectedSkills, skillId])
    } else {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId))
    }
  }

  const handleGenerate = async () => {
    if (activeTab === "standard" && selectedSkills.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one skill",
        variant: "destructive",
      })
      return
    }

    if (!selectedJobRole) {
      toast({
        title: "Error",
        description: "Please select a job role",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedQuestions([])
    setSavedQuestionIds(new Set())

    try {
      const generator = new InterviewQuestionGenerator()

      let questions: InterviewQuestion[] = []

      if (activeTab === "standard") {
        // Convert skill IDs to skill labels
        const skillLabels = selectedSkills.map(
          (skillId) => skillsData.find((skill) => skill.id === skillId)?.label || skillId,
        )

        const result = await generator.generateStandardQuestions(
          selectedJobRole,
          skillLabels,
          complexity[0],
          questionCount,
        )

        questions = result.map((q) => ({
          ...q,
          jobRole: selectedJobRole,
          source: "ai",
        }))
      } else {
        // News-based questions
        const result = await generator.generateNewsBasedQuestions(selectedJobRole)

        questions = result.map((q) => ({
          ...q,
          jobRole: selectedJobRole,
          source: "news",
        }))
      }

      setGeneratedQuestions(questions)

      toast({
        title: "Success",
        description: `Generated ${questions.length} questions successfully`,
      })
    } catch (error) {
      console.error("Error generating questions:", error)
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveQuestion = async (question: InterviewQuestion, index: number) => {
    setIsSaving({ ...isSaving, [index]: true })

    try {
      const id = await addQuestion(question)
      setSavedQuestionIds(new Set([...savedQuestionIds, id]))

      toast({
        title: "Success",
        description: "Question saved to the question bank",
      })
    } catch (error) {
      console.error("Error saving question:", error)
      toast({
        title: "Error",
        description: "Failed to save question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving({ ...isSaving, [index]: false })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">AI Question Generation</h2>

      <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="standard">Standard Questions</TabsTrigger>
          <TabsTrigger value="news">News-Based Questions</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>Job Role</Label>
                <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a job role" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRoles.map((role) => (
                      <SelectItem key={role.id || role.title} value={role.title}>
                        {role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="standard" className="space-y-6 mt-0 pt-0">
                <div>
                  <Label>Complexity</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm">Easy</span>
                    <Slider value={complexity} onValueChange={setComplexity} max={100} step={1} className="flex-1" />
                    <span className="text-sm">Hard</span>
                  </div>
                </div>

                <div>
                  <Label>Number of Questions</Label>
                  <Select
                    value={questionCount.toString()}
                    onValueChange={(value) => setQuestionCount(Number.parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Skills</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {skillsData.map((skill) => (
                      <div key={skill.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill.id}`}
                          checked={selectedSkills.includes(skill.id)}
                          onCheckedChange={(checked) => handleSkillChange(skill.id, checked === true)}
                        />
                        <Label htmlFor={`skill-${skill.id}`}>{skill.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="news" className="space-y-6 mt-0 pt-0">
                <div className="text-sm text-muted-foreground">
                  This will generate questions based on recent news and trends related to the selected job role.
                </div>
              </TabsContent>

              <Button
                onClick={handleGenerate}
                className="w-full bg-[#19A5A2] hover:bg-[#19A5A2]/90"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  "Generate Questions"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {generatedQuestions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generated Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedQuestions.map((question, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <Badge>{question.category}</Badge>
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
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveQuestion(question, index)}
                        disabled={isSaving[index] || Array.from(savedQuestionIds).includes(question.id || "")}
                      >
                        {isSaving[index] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : Array.from(savedQuestionIds).includes(question.id || "") ? (
                          "Saved"
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                    <h3 className="font-medium mt-2">{question.question}</h3>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Expected Answer:</p>
                      <p className="text-sm mt-1">{question.expectedAnswer}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {question.skillTags?.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  )
}

