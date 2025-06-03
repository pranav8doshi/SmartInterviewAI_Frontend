import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Video, Bell, CheckCircle, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-[#1B2A4E] to-[#19A5A2]">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">InterviewAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-white hover:text-white/80">
              Home
            </Link>
            <Link href="#about" className="text-sm font-medium text-white hover:text-white/80">
              About Us
            </Link>
            <Link href="#features" className="text-sm font-medium text-white hover:text-white/80">
              Features
            </Link>
            <Link href="#contact" className="text-sm font-medium text-white hover:text-white/80">
              Contact
            </Link>
            <Button className="bg-white text-[#19A5A2] hover:bg-white/90">Login / Register</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#1B2A4E] to-[#19A5A2] text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-flex items-center rounded-lg bg-white/10 px-3 py-1 text-sm">
                <span className="text-white">✨ AI-Powered Interview Platform</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none xl:text-7xl/none">
                Prepare. Apply. <span className="text-[#F37021]">Get Hired.</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Transform your interview process with AI-powered interviews. Practice, perfect, and land your dream job
                with our cutting-edge platform.
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Button className="bg-[#19A5A2] text-white hover:bg-[#19A5A2]/90 h-11 px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#19A5A2] h-11 px-8"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-[#19A5A2]/10 px-3 py-1 text-sm text-[#19A5A2]">
                  <span>Key Features</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything you need</h2>
                <p className="mx-auto max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides all the tools you need for a seamless interview experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
              <div className="relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#19A5A2]/10 text-[#19A5A2] mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Apply for Interviews</h3>
                <p className="text-gray-500 mt-2">Submit applications and get matched with perfect opportunities.</p>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#19A5A2]/10 text-[#19A5A2] mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Schedule & Manage</h3>
                <p className="text-gray-500 mt-2">Easily schedule and manage your upcoming interviews.</p>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#19A5A2]/10 text-[#19A5A2] mb-4">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Video Interviews</h3>
                <p className="text-gray-500 mt-2">Conduct seamless video interviews with our integrated platform.</p>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#19A5A2]/10 text-[#19A5A2] mb-4">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Notifications</h3>
                <p className="text-gray-500 mt-2">Stay updated with real-time notifications and reminders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#19A5A2]/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-[#19A5A2]/10 px-3 py-1 text-sm text-[#19A5A2]">
                  <span>Simple Process</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="mx-auto max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get started with our platform in three simple steps
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              <div className="relative overflow-hidden rounded-lg border bg-white p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#19A5A2] text-white text-xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold">Create an Account</h3>
                <p className="text-gray-500 mt-2">Choose between HR or Candidate profile and get started.</p>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-white p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#19A5A2] text-white text-xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold">Apply & Schedule</h3>
                <p className="text-gray-500 mt-2">Browse opportunities and schedule your interviews.</p>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-white p-8 shadow-sm transition-all hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#19A5A2] text-white text-xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold">Join & Track</h3>
                <p className="text-gray-500 mt-2">Attend interviews and track your progress.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-[#19A5A2]/10 px-3 py-1 text-sm text-[#19A5A2]">
                  <span>Testimonials</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Success Stories</h2>
                <p className="mx-auto max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from our successful candidates and hiring managers
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <p className="text-gray-600">
                    "InterviewAI helped me prepare and land my dream job at a top tech company. The platform is
                    intuitive and effective."
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold text-[#19A5A2]">Sarah K.</p>
                    <p className="text-sm text-gray-500">Software Engineer</p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <p className="text-gray-600">
                    "As an HR manager, this platform has streamlined our entire interview process. It's a game-changer!"
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold text-[#19A5A2]">Michael R.</p>
                    <p className="text-sm text-gray-500">HR Director</p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <p className="text-gray-600">
                    "The AI-powered features have significantly improved our candidate evaluation process."
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold text-[#19A5A2]">Emily T.</p>
                    <p className="text-sm text-gray-500">Recruitment Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-[#1B2A4E] text-white">
        <div className="container px-4 py-12 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">InterviewAI</h3>
              <p className="text-sm text-gray-300">Transforming the interview process with AI technology.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact</h3>
              <p className="text-sm text-gray-300">Email: contact@interviewai.com</p>
              <p className="text-sm text-gray-300">Phone: (555) 123-4567</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/privacy" className="hover:text-[#19A5A2]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#19A5A2]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="flex space-x-4 text-gray-300">
                <Link href="#" className="hover:text-[#19A5A2]">
                  Twitter
                </Link>
                <Link href="#" className="hover:text-[#19A5A2]">
                  LinkedIn
                </Link>
                <Link href="#" className="hover:text-[#19A5A2]">
                  Facebook
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

