"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Briefcase, Save, Plus, Trash, Edit, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ScenarioBasedQuestions() {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<any[]>([
    {
      id: "s1",
      title: "Handling Technical Debt",
      description:
        "You've joined a team working on a legacy codebase with significant technical debt. The team is under pressure to deliver new features, but the codebase makes it difficult to implement changes reliably.",
      jobRole: "Senior Developer",
      difficulty: "Advanced",
      questions: [
        "How would you approach assessing the technical debt in the codebase?",
        "What strategies would you propose to balance new feature development with addressing technical debt?",
        "How would you convince stakeholders of the importance of addressing technical debt?",
      ],
      expectedOutcomes: [
        "Ability to analyze and prioritize technical debt",
        "Strategic thinking and planning skills",
        "Communication and stakeholder management",
      ],
    },
  ])
  const [isEditing, setIsEditing] = useState(false)
  const [currentScenario, setCurrentScenario] = useState({
    id: "",
    title: "",
    description: "",
    jobRole: "",
    difficulty: "",
    questions: [""],
    expectedOutcomes: [""],
  })

  const handleAddScenario = () => {
    setIsEditing(true)
    setCurrentScenario({
      id: `s${Date.now()}`,
      title: "",
      description: "",
      jobRole: "",
      difficulty: "",
      questions: [""],
      expectedOutcomes: [""],
    })
  }

  const handleEditScenario = (scenario: any) => {
    setIsEditing(true)
    setCurrentScenario(scenario)
  }

  const handleSaveScenario = () => {
    if (!currentScenario.title || !currentScenario.description) {
      alert("Please fill in all required fields")
      return
    }

    if (scenarios.some((s) => s.id === currentScenario.id)) {
      setScenarios(scenarios.map((s) => (s.id === currentScenario.id ? currentScenario : s)))
    } else {
      setScenarios([...scenarios, currentScenario])
    }

    setIsEditing(false)
    setCurrentScenario({
      id: "",
      title: "",
      description: "",
      jobRole: "",
      difficulty: "",
      questions: [""],
      expectedOutcomes: [""],
    })
  }

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id))
  }

  const handleAddQuestion = () => {
    setCurrentScenario({
      ...currentScenario,
      questions: [...currentScenario.questions, ""],
    })
  }

  const handleUpdateQuestion = (index: number, value: string) => {
    const updatedQuestions = [...currentScenario.questions]
    updatedQuestions[index] = value
    setCurrentScenario({
      ...currentScenario,
      questions: updatedQuestions,
    })
  }

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...currentScenario.questions]
    updatedQuestions.splice(index, 1)
    setCurrentScenario({
      ...currentScenario,
      questions: updatedQuestions,
    })
  }

  const handleAddOutcome = () => {
    setCurrentScenario({
      ...currentScenario,
      expectedOutcomes: [...currentScenario.expectedOutcomes, ""],
    })
  }

  const handleUpdateOutcome = (index: number, value: string) => {
    const updatedOutcomes = [...currentScenario.expectedOutcomes]
    updatedOutcomes[index] = value
    setCurrentScenario({
      ...currentScenario,
      expectedOutcomes: updatedOutcomes,
    })
  }

  const handleRemoveOutcome = (index: number) => {
    const updatedOutcomes = [...currentScenario.expectedOutcomes]
    updatedOutcomes.splice(index, 1)
    setCurrentScenario({
      ...currentScenario,
      expectedOutcomes: updatedOutcomes,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/hr-dashboard/question-bank")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Scenario-Based Questions</h1>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Create realistic scenarios to assess how candidates would handle real-world situations.
        </p>
        <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleAddScenario}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Scenario
        </Button>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{currentScenario.id ? "Edit Scenario" : "Create New Scenario"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Scenario Title</Label>
                <Input
                  id="title"
                  placeholder="E.g., Handling Technical Debt"
                  value={currentScenario.title}
                  onChange={(e) => setCurrentScenario({ ...currentScenario, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Scenario Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the scenario in detail..."
                  rows={4}
                  value={currentScenario.description}
                  onChange={(e) => setCurrentScenario({ ...currentScenario, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Role</Label>
                  <Select
                    value={currentScenario.jobRole}
                    onValueChange={(value) => setCurrentScenario({ ...currentScenario, jobRole: value })}
                  >
                    <SelectTrigger id="jobRole">
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior Developer">Junior Developer</SelectItem>
                      <SelectItem value="Mid-level Developer">Mid-level Developer</SelectItem>
                      <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                      <SelectItem value="Tech Lead">Tech Lead</SelectItem>
                      <SelectItem value="Engineering Manager">Engineering Manager</SelectItem>
                      <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={currentScenario.difficulty}
                    onValueChange={(value) => setCurrentScenario({ ...currentScenario, difficulty: value })}
                  >
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
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions to Ask</Label>
                <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Question
                </Button>
              </div>

              {currentScenario.questions.map((question, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Textarea
                    placeholder={`Question ${index + 1}`}
                    value={question}
                    onChange={(e) => handleUpdateQuestion(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={currentScenario.questions.length <= 1}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Expected Outcomes</Label>
                <Button variant="outline" size="sm" onClick={handleAddOutcome}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Outcome
                </Button>
              </div>

              {currentScenario.expectedOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    placeholder={`Outcome ${index + 1}`}
                    value={outcome}
                    onChange={(e) => handleUpdateOutcome(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOutcome(index)}
                    disabled={currentScenario.expectedOutcomes.length <= 1}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tip</AlertTitle>
              <AlertDescription>
                Good scenarios are specific, realistic, and allow candidates to demonstrate both technical and soft
                skills.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setCurrentScenario({
                    id: "",
                    title: "",
                    description: "",
                    jobRole: "",
                    difficulty: "",
                    questions: [""],
                    expectedOutcomes: [""],
                  })
                }}
              >
                Cancel
              </Button>
              <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleSaveScenario}>
                <Save className="mr-2 h-4 w-4" />
                Save Scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {scenarios.length > 0 ? (
            scenarios.map((scenario) => (
              <Card key={scenario.id} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-xl font-medium">{scenario.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{scenario.jobRole}</Badge>
                          <Badge variant="outline">{scenario.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditScenario(scenario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteScenario(scenario.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-700">{scenario.description}</p>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="questions">
                        <AccordionTrigger>Questions ({scenario.questions.length})</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 pl-6 list-disc">
                            {scenario.questions.map((question: string, index: number) => (
                              <li key={index} className="text-gray-700">
                                {question}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="outcomes">
                        <AccordionTrigger>Expected Outcomes</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 pl-6 list-disc">
                            {scenario.expectedOutcomes.map((outcome: string, index: number) => (
                              <li key={index} className="text-gray-700">
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex justify-end">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-3 w-3" />
                        Add to Interview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="h-64 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Briefcase className="h-16 w-16 text-gray-200 mx-auto" />
                <h2 className="text-xl font-medium">No Scenarios Yet</h2>
                <p className="text-gray-500 max-w-md">
                  Create your first scenario-based question to assess how candidates would handle real-world situations.
                </p>
                <Button className="bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleAddScenario}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Scenario
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {!isEditing && scenarios.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800">Scenario-Based Question Tips</h3>
              <ul className="mt-2 space-y-1 text-sm text-orange-700 list-disc pl-5">
                <li>Focus on real-world situations that candidates might encounter in the role</li>
                <li>Include both technical challenges and interpersonal/team dynamics</li>
                <li>Tailor scenarios to different experience levels</li>
                <li>Look for problem-solving approach rather than just the final answer</li>
                <li>Consider including follow-up questions to probe deeper into their thinking</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

