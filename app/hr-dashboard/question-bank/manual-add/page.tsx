"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Plus, Trash, Sparkles, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import improveInterviewQuestion, { type QuestionImprovement } from "@/lib/ai-question-service"
import { addQuestion } from "@/lib/question-bank-service"

export default function ManualQuestionAdd() {
  const router = useRouter()
  const { toast } = useToast()
  const [question, setQuestion] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [jobRole, setJobRole] = useState("")
  const [skillTags, setSkillTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [expectedAnswer, setExpectedAnswer] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // AI improvement states
  const [isImproving, setIsImproving] = useState(false)
  const [improvement, setImprovement] = useState<QuestionImprovement | null>(null)
  const [activeTab, setActiveTab] = useState<string>("original")

  const handleAddTag = () => {
    if (currentTag && !skillTags.includes(currentTag)) {
      setSkillTags([...skillTags, currentTag])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSkillTags(skillTags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    if (!question || !category || !difficulty || !jobRole) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Save the question to Firebase
      await addQuestion({
        question,
        category,
        difficulty,
        jobRole,
        skillTags,
        expectedAnswer,
        source: "manual",
      })

      toast({
        title: "Success",
        description: "Question saved successfully!",
      })
      router.push("/hr-dashboard/question-bank")
    } catch (error) {
      console.error("Error saving question:", error)
      toast({
        title: "Error",
        description: "Failed to save question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImproveQuestion = async () => {
    if (!question) {
      toast({
        title: "Error",
        description: "Please enter a question to improve",
        variant: "destructive",
      })
      return
    }

    setIsImproving(true)
    try {
      const result = await improveInterviewQuestion(
        question,
        category || "General",
        difficulty || "Intermediate",
        jobRole || "General",
        skillTags,
      )

      setImprovement(result)
      setActiveTab("improved")
    } catch (error) {
      console.error("Error improving question:", error)
      toast({
        title: "Error",
        description: "Failed to improve question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const applyImprovedQuestion = () => {
    if (improvement) {
      setQuestion(improvement.improvedQuestion)
      setActiveTab("original")

      // If there are suggested answer points, update the expected answer
      if (improvement.suggestedAnswerPoints && improvement.suggestedAnswerPoints.length > 0) {
        const formattedPoints = improvement.suggestedAnswerPoints.join("\n\n• ")
        setExpectedAnswer(`• ${formattedPoints}`)
      }

      toast({
        title: "Success",
        description: "Improved question applied!",
      })
    }
  }

  const applyAlternativeVersion = (version: string) => {
    setQuestion(version)
    setActiveTab("original")
    toast({
      title: "Success",
      description: "Alternative version applied!",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/hr-dashboard/question-bank")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Add New Question</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="question">Question</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImproveQuestion}
                      disabled={isImproving || !question}
                      className="flex items-center gap-1"
                    >
                      {isImproving ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Improving...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-[#19A5A2]" />
                          <span>Improve with AI</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="question"
                    placeholder="Enter your question here..."
                    rows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Behavioral">Behavioral</SelectItem>
                        <SelectItem value="Problem Solving">Problem Solving</SelectItem>
                        <SelectItem value="System Design">System Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Role</Label>
                  <Select value={jobRole} onValueChange={setJobRole}>
                    <SelectTrigger id="jobRole">
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                      <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                      <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                      <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                      <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                      <SelectItem value="Machine Learning Engineer">Machine Learning Engineer</SelectItem>
                      <SelectItem value="UX Designer">UX Designer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skillTags">Skill Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skillTags"
                      placeholder="Add skill tag"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" size="icon" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillTags.map((tag) => (
                      <Badge key={tag} className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 rounded-full hover:bg-red-200 p-0.5"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedAnswer">Expected Answer</Label>
                  <Textarea
                    id="expectedAnswer"
                    placeholder="Enter the expected answer or key points..."
                    rows={4}
                    value={expectedAnswer}
                    onChange={(e) => setExpectedAnswer(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Question
              </>
            )}
          </Button>
        </div>

        <div>
          {improvement ? (
            <Card>
              <CardHeader>
                <CardTitle>AI-Improved Question</CardTitle>
                <CardDescription>Review the AI suggestions and apply them if you find them helpful</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    <TabsTrigger value="improved">AI Improved</TabsTrigger>
                  </TabsList>

                  <TabsContent value="original">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[200px]">
                      <p className="font-medium text-gray-700">{question}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="improved">
                    <div className="space-y-4">
                      <div className="bg-[#19A5A2]/10 p-4 rounded-lg border border-[#19A5A2]/20">
                        <p className="font-medium text-gray-700">{improvement.improvedQuestion}</p>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={applyImprovedQuestion} className="bg-[#19A5A2] hover:bg-[#19A5A2]/90">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Apply Improvement
                        </Button>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Improvement Explanation</AlertTitle>
                        <AlertDescription>{improvement.explanation}</AlertDescription>
                      </Alert>

                      {improvement.alternativeVersions && improvement.alternativeVersions.length > 0 && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="alternatives">
                            <AccordionTrigger>Alternative Versions</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                {improvement.alternativeVersions.map((version, index) => (
                                  <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <p className="text-gray-700 mb-2">{version}</p>
                                    <div className="flex justify-end">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => applyAlternativeVersion(version)}
                                      >
                                        Apply This Version
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      {improvement.suggestedAnswerPoints && improvement.suggestedAnswerPoints.length > 0 && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="answer-points">
                            <AccordionTrigger>Suggested Answer Points</AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc pl-5 space-y-2">
                                {improvement.suggestedAnswerPoints.map((point, index) => (
                                  <li key={index} className="text-gray-700">
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Question Preview</CardTitle>
                <CardDescription>See how your question will appear to candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[400px]">
                  {question ? (
                    <div className="space-y-4">
                      <div className="bg-[#19A5A2]/10 p-3 rounded-lg border border-[#19A5A2]/20">
                        <p className="font-medium text-gray-700">{question}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">The AI might follow up with:</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="bg-gray-100 p-2 rounded">
                            "Could you elaborate on your approach to this problem?"
                          </li>
                          <li className="bg-gray-100 p-2 rounded">
                            "What challenges might you face when implementing this solution?"
                          </li>
                          <li className="bg-gray-100 p-2 rounded">"Can you think of any alternative approaches?"</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Eye className="h-12 w-12 mb-2 opacity-20" />
                      <p>Question preview will appear here</p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Question Details:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Category:</span> {category || "Not set"}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Difficulty:</span> {difficulty || "Not set"}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Job Role:</span> {jobRole || "Not set"}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Skills:</span> {skillTags.length ? skillTags.join(", ") : "None"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI Question Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">Use our AI to improve your interview questions. The AI can:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Make questions clearer and more specific</li>
                  <li>Adjust difficulty level appropriately</li>
                  <li>Suggest alternative versions of the question</li>
                  <li>Provide key points for expected answers</li>
                  <li>Tailor questions to specific job roles and skills</li>
                </ul>
                <Alert className="bg-[#19A5A2]/10 border-[#19A5A2]/20">
                  <Sparkles className="h-4 w-4 text-[#19A5A2]" />
                  <AlertTitle className="text-[#19A5A2]">Pro Tip</AlertTitle>
                  <AlertDescription>
                    For best results, provide a draft question, select a category, difficulty level, and add relevant
                    skill tags before using the AI improvement feature.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

