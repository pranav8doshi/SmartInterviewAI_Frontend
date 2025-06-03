"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video } from "lucide-react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

export default function StudentLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let userCredential
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, "students", userCredential.user.uid), {
          email: email,
          createdAt: new Date().toISOString(),
          upcomingInterviews: 0,
          totalApplications: 0,
          latestInterviewStatus: "N/A",
          nextInterview: null,
        })
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      }

      const userDoc = await getDoc(doc(db, "students", userCredential.user.uid))
      if (!userDoc.exists()) {
        throw new Error("User document does not exist")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing in:", error)
      toast({
        title: "Error",
        description: isSignUp
          ? "Failed to sign up. Please try again."
          : "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4E] to-[#19A5A2] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <Video className="h-12 w-12 text-[#19A5A2]" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Student {isSignUp ? "Sign Up" : "Login"}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-[#19A5A2] hover:bg-[#19A5A2]/90" disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-[#19A5A2] hover:underline">
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
        <div className="mt-6 text-center">
          <Link href="/login/hr" className="text-sm text-[#19A5A2] hover:underline">
            HR Login
          </Link>
          {" | "}
          <Link href="/login/super-admin" className="text-sm text-[#19A5A2] hover:underline">
            Super Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}

