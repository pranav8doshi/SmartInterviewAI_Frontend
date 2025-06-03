"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"

interface JobRole {
  id: string
  title: string
  description: string
  requirements: string
  responsibilities: string
  salary: string
  location: string
}

export default function ApplyForInterview() {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([])
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    contactNumber: "",
    email: "",
    address: "",
    qualification: "",
    university: "",
    yearOfPassing: "",
    marks: "",
    certifications: "",
    experience: "",
    companies: "",
    jobTitles: "",
    employmentDuration: "",
    responsibilities: "",
    skills: "",
    technicalSkills: "",
    softSkills: "",
    portfolioLink: "",
    preferredJobRole: "",
    expectedSalary: "",
    preferredLocations: "",
    willRelocate: "",
    availabilityToJoin: "",
    linkedinProfile: "",
    githubProfile: "",
    references: "",
    additionalRemarks: "",
  })
  const { toast } = useToast()
  const [userApplications, setUserApplications] = useState<string[]>([])

  useEffect(() => {
    const fetchUserApplications = async () => {
      const user = auth.currentUser
      if (user) {
        const applicationsQuery = query(collection(db, "applications"), where("userId", "==", user.uid))
        const applicationsSnapshot = await getDocs(applicationsQuery)
        const appliedJobRoles = applicationsSnapshot.docs.map((doc) => doc.data().preferredJobRole)
        setUserApplications(appliedJobRoles)
      }
    }

    fetchUserApplications()
  }, [])

  useEffect(() => {
    const fetchJobRoles = async () => {
      const user = auth.currentUser
      if (!user) return

      const querySnapshot = await getDocs(collection(db, "jobRoles"))
      const jobs: JobRole[] = []
      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as JobRole)
      })
      setJobRoles(jobs)

      // Fetch user's applications
      const applicationsQuery = query(collection(db, "applications"), where("userId", "==", user.uid))
      const applicationsSnapshot = await getDocs(applicationsQuery)
      const appliedJobIds = applicationsSnapshot.docs.map((doc) => doc.data().jobRoleId)
      setUserApplications(appliedJobIds)
    }

    fetchJobRoles()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) {
      toast({
        title: "Error",
        description: "Please select a job role to apply for.",
        variant: "destructive",
      })
      return
    }

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No authenticated user found")
      }

      const appliedAt = new Date()
      const validUntil = new Date(appliedAt)
      validUntil.setDate(validUntil.getDate() + 3) // Valid for 3 days

      await addDoc(collection(db, "applications"), {
        ...formData,
        jobRoleId: selectedJob,
        userId: user.uid,
        appliedAt: appliedAt.toISOString(),
        validUntil: validUntil.toISOString(),
        status: "Applied", // Changed from "Pending" since we're removing HR approval dependency
        isScheduled: false, // Track if the interview has been scheduled
      })

      toast({
        title: "Success",
        description: "Your application has been submitted successfully.",
      })

      // Reset form and selected job
      setFormData({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        nationality: "",
        contactNumber: "",
        email: "",
        address: "",
        qualification: "",
        university: "",
        yearOfPassing: "",
        marks: "",
        certifications: "",
        experience: "",
        companies: "",
        jobTitles: "",
        employmentDuration: "",
        responsibilities: "",
        skills: "",
        technicalSkills: "",
        softSkills: "",
        portfolioLink: "",
        preferredJobRole: "",
        expectedSalary: "",
        preferredLocations: "",
        willRelocate: "",
        availabilityToJoin: "",
        linkedinProfile: "",
        githubProfile: "",
        references: "",
        additionalRemarks: "",
      })
      setSelectedJob(null)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Apply for Interview</h2>
      {!selectedJob ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobRoles.map((job) => (
            <Card
              key={job.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                userApplications.includes(job.id) ? "opacity-50" : ""
              }`}
              onClick={() => !userApplications.includes(job.id) && setSelectedJob(job.id)}
            >
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{job.description}</p>
                <p className="mt-2">
                  <strong>Salary:</strong> {job.salary}
                </p>
                <p>
                  <strong>Location:</strong> {job.location}
                </p>
                {userApplications.includes(job.id) && <p className="text-green-500 font-semibold mt-2">Applied</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Application Form for {jobRoles.find((job) => job.id === selectedJob)?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Current Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Educational Background */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. Educational Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualification">Highest Qualification</Label>
                    <Input
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="university">University/College Name</Label>
                    <Input
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearOfPassing">Year of Passing</Label>
                    <Input
                      id="yearOfPassing"
                      name="yearOfPassing"
                      type="number"
                      value={formData.yearOfPassing}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="marks">Marks/CGPA</Label>
                    <Input id="marks" name="marks" value={formData.marks} onChange={handleInputChange} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="certifications">Additional Certifications</Label>
                  <Textarea
                    id="certifications"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">3. Work Experience</h3>
                <div>
                  <Label htmlFor="experience">Total Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="companies">Company Name(s)</Label>
                  <Input id="companies" name="companies" value={formData.companies} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="jobTitles">Job Title(s)</Label>
                  <Input id="jobTitles" name="jobTitles" value={formData.jobTitles} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="employmentDuration">Duration of Employment</Label>
                  <Input
                    id="employmentDuration"
                    name="employmentDuration"
                    value={formData.employmentDuration}
                    onChange={handleInputChange}
                    placeholder="e.g., Jan 2020 - Present"
                  />
                </div>
                <div>
                  <Label htmlFor="responsibilities">Key Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Skills & Expertise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">4. Skills & Expertise</h3>
                <div>
                  <Label htmlFor="technicalSkills">Technical Skills</Label>
                  <Textarea
                    id="technicalSkills"
                    name="technicalSkills"
                    value={formData.technicalSkills}
                    onChange={handleInputChange}
                    name="technicalSkills"
                    value={formData.technicalSkills}
                    onChange={handleInputChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>
                <div>
                  <Label htmlFor="softSkills">Soft Skills</Label>
                  <Textarea
                    id="softSkills"
                    name="softSkills"
                    value={formData.softSkills}
                    onChange={handleInputChange}
                    placeholder="e.g., Communication, Leadership, Problem-Solving"
                  />
                </div>
              </div>

              {/* Resume & Portfolio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">5. Resume & Portfolio</h3>
                <div>
                  <Label htmlFor="portfolioLink">Portfolio Link</Label>
                  <Input
                    id="portfolioLink"
                    name="portfolioLink"
                    type="url"
                    value={formData.portfolioLink}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Job Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">6. Job Preferences</h3>
                <div>
                  <Label htmlFor="preferredJobRole">Preferred Job Role</Label>
                  <Input
                    id="preferredJobRole"
                    name="preferredJobRole"
                    value={formData.preferredJobRole}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedSalary">Expected Salary</Label>
                  <Input
                    id="expectedSalary"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="preferredLocations">Preferred Location(s)</Label>
                  <Input
                    id="preferredLocations"
                    name="preferredLocations"
                    value={formData.preferredLocations}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="willRelocate">Willing to Relocate?</Label>
                  <RadioGroup
                    name="willRelocate"
                    value={formData.willRelocate}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, willRelocate: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="willRelocate-yes" />
                      <Label htmlFor="willRelocate-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="willRelocate-no" />
                      <Label htmlFor="willRelocate-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="availabilityToJoin">Availability to Join</Label>
                  <Input
                    id="availabilityToJoin"
                    name="availabilityToJoin"
                    value={formData.availabilityToJoin}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 weeks notice"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">7. Additional Information</h3>
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <Input
                    id="linkedinProfile"
                    name="linkedinProfile"
                    type="url"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="githubProfile">GitHub/Personal Website</Label>
                  <Input
                    id="githubProfile"
                    name="githubProfile"
                    type="url"
                    value={formData.githubProfile}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="references">References</Label>
                  <Textarea
                    id="references"
                    name="references"
                    value={formData.references}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="additionalRemarks">Any Additional Remarks</Label>
                  <Textarea
                    id="additionalRemarks"
                    name="additionalRemarks"
                    value={formData.additionalRemarks}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#19A5A2] hover:bg-[#19A5A2]/90">
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

