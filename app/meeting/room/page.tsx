"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  MoreVertical,
  Share2,
  Pin,
  Minimize,
  Maximize,
  LayoutGrid,
  FileText,
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { ChatPanel } from "../components/chat-panel"
import { ParticipantsPanel } from "../components/participants-panel"
import { VoiceAnimation } from "../components/voice-animation"
import { ReportPanel } from "../components/report-panel"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { startInterview, getNextQuestion, submitAnswer, endInterview, type InterviewMessage } from "@/lib/api-service"
import { doc, onSnapshot } from "firebase/firestore"

export default function MeetingRoom() {
  const [userName, setUserName] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [jobRole, setJobRole] = useState<string>("")
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [activePanel, setActivePanel] = useState<"chat" | "participants" | "report" | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [pinnedVideo, setPinnedVideo] = useState<"user" | "ai" | null>(null)
  const [minimizedVideo, setMinimizedVideo] = useState<"user" | "ai" | null>(null)
  const [layout, setLayout] = useState<"grid" | "spotlight">("grid")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [conversation, setConversation] = useState<InterviewMessage[]>([])
  const [isInterviewEnded, setIsInterviewEnded] = useState(false)
  const [isInterviewActive, setIsInterviewActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Get user info and query params
    const user = auth.currentUser
    if (user) {
      setUserName(user.displayName || user.email?.split("@")[0] || "User")
      setUserEmail(user.email || "")

      const role = searchParams.get("role")
      if (role) {
        setJobRole(role)
      } else {
        toast({
          title: "Missing Information",
          description: "Job role information is missing.",
          variant: "destructive",
        })
        router.push("/dashboard")
        return
      }
    } else {
      router.push("/login/student")
      return
    }

    // Initialize camera and microphone
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
        toast({
          title: "Media Error",
          description: "Could not access camera or microphone.",
          variant: "destructive",
        })
      }
    }

    initializeMedia()

    return () => {
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      // End the interview if it's still active
      if (sessionId && isInterviewActive) {
        endInterview(sessionId).catch(console.error)
      }
    }
  }, [router, toast, searchParams])

  // Start the interview when component mounts
  useEffect(() => {
    if (userEmail && jobRole && !sessionId) {
      const initInterview = async () => {
        try {
          const id = await startInterview({
            email: userEmail,
            jobRole: jobRole,
          })
          setSessionId(id)
          setIsInterviewActive(true)

          // Add initial system message
          setConversation([
            {
              role: "ai",
              content: `Welcome to your ${jobRole} interview. I'll be asking you some questions to evaluate your skills and experience. Let's begin.`,
              timestamp: new Date(),
            },
          ])

          // Start AI speaking
          speakAiMessage(
            `Welcome to your ${jobRole} interview. I'll be asking you some questions to evaluate your skills and experience. Let's begin.`,
          )
        } catch (error) {
          console.error("Failed to start interview:", error)
          toast({
            title: "Interview Error",
            description: "Failed to start the interview. Please try again.",
            variant: "destructive",
          })
        }
      }

      initInterview()
    }
  }, [userEmail, jobRole, sessionId, toast])

  // Set up audio visualization
  useEffect(() => {
    if (!stream || !isMicOn) {
      setAudioLevel(0)
      return
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }

      const audioContext = audioContextRef.current
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256

      const audioSource = audioContext.createMediaStreamSource(stream)
      audioSource.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      dataArrayRef.current = dataArray

      const checkAudioLevel = () => {
        if (!analyserRef.current || !dataArrayRef.current) return

        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        const average = dataArrayRef.current.reduce((acc, val) => acc + val, 0) / dataArrayRef.current.length
        setAudioLevel(average)

        requestAnimationFrame(checkAudioLevel)
      }

      checkAudioLevel()
    } catch (error) {
      console.error("Error setting up audio visualization:", error)
    }
  }, [stream, isMicOn])

  // Update screen sharing video
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream
    }
  }, [screenStream])

  // Listen for Firebase updates on interview status
  useEffect(() => {
    if (!userEmail) return

    const unsubscribe = onSnapshot(doc(db, "interviews", userEmail), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data()
        if (data.status === "completed") {
          setIsInterviewEnded(true)
          setIsInterviewActive(false)

          // Add final message
          setConversation((prev) => [
            ...prev,
            {
              role: "ai",
              content: "Thank you for completing the interview. Your responses have been recorded.",
              timestamp: new Date(),
            },
          ])

          // Speak final message
          speakAiMessage("Thank you for completing the interview. Your responses have been recorded.")
        }
      }
    })

    return () => unsubscribe()
  }, [userEmail])

  // Function to handle AI speech
  const speakAiMessage = (text: string) => {
    setIsAiSpeaking(true)

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Try to find a female voice
    const voices = window.speechSynthesis.getVoices()
    const femaleVoice = voices.find(
      (voice) => voice.name.includes("female") || voice.name.includes("Samantha") || voice.name.includes("Zira"),
    )

    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    utterance.rate = 1.0
    utterance.pitch = 1.1

    // Store reference to cancel if needed
    speechSynthesisRef.current = utterance

    // Handle speech end
    utterance.onend = () => {
      setIsAiSpeaking(false)
      speechSynthesisRef.current = null

      // If interview is active, listen for user response
      if (isInterviewActive && !isInterviewEnded) {
        listenForUserResponse()
      }
    }

    // Start speaking
    window.speechSynthesis.speak(utterance)
  }

  // Function to simulate speech recognition
  const listenForUserResponse = () => {
    // In a real implementation, this would use the Web Speech API
    // For now, we'll just show a toast to prompt the user to type their response
    toast({
      title: "Your turn",
      description: "Please type your response in the chat panel",
    })

    // Open chat panel automatically
    setActivePanel("chat")
  }

  // Function to handle user's answer submission
  const handleAnswerSubmit = async (answer: string) => {
    if (!sessionId || !isInterviewActive) return

    // Add user message to conversation
    setConversation((prev) => [
      ...prev,
      {
        role: "user",
        content: answer,
        timestamp: new Date(),
      },
    ])

    try {
      // Submit answer to backend
      await submitAnswer(sessionId, answer)

      // Get next question
      const nextQuestion = await getNextQuestion(sessionId)

      // Add AI message to conversation
      setConversation((prev) => [
        ...prev,
        {
          role: "ai",
          content: nextQuestion.content,
          timestamp: new Date(),
        },
      ])

      // Speak next question
      speakAiMessage(nextQuestion.content)
    } catch (error) {
      console.error("Error in interview flow:", error)
      toast({
        title: "Interview Error",
        description: "There was an error processing your response.",
        variant: "destructive",
      })
    }
  }

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isCameraOn
      })
      setIsCameraOn(!isCameraOn)
    }
  }

  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !isMicOn
      })
      setIsMicOn(!isMicOn)
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
        setScreenStream(null)
      }
      setIsScreenSharing(false)
    } else {
      // Start screen sharing
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        })

        setScreenStream(displayStream)
        setIsScreenSharing(true)

        // Auto-stop when user ends sharing from browser UI
        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          setScreenStream(null)
        }
      } catch (error) {
        console.error("Error sharing screen:", error)
        toast({
          title: "Screen Sharing Error",
          description: "Could not share your screen.",
          variant: "destructive",
        })
      }
    }
  }

  const togglePanel = (panel: "chat" | "participants" | "report") => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  const togglePinVideo = (video: "user" | "ai") => {
    if (pinnedVideo === video) {
      setPinnedVideo(null)
    } else {
      setPinnedVideo(video)
      setMinimizedVideo(null)
      setLayout("spotlight")
    }
  }

  const toggleMinimizeVideo = (video: "user" | "ai") => {
    if (minimizedVideo === video) {
      setMinimizedVideo(null)
    } else {
      setMinimizedVideo(video)
      if (pinnedVideo === video) {
        setPinnedVideo(null)
      }
    }
  }

  const toggleLayout = () => {
    setLayout(layout === "grid" ? "spotlight" : "grid")
    setPinnedVideo(null)
    setMinimizedVideo(null)
  }

  const endCall = async () => {
    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }

    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel()
    }

    // End the interview if it's still active
    if (sessionId && isInterviewActive) {
      try {
        await endInterview(sessionId)
      } catch (error) {
        console.error("Error ending interview:", error)
      }
    }

    // Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">InterviewAI</h1>
          <span className="ml-4 text-gray-300">{jobRole} Interview</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-white">{userName}</span>
          <div className="w-10 h-10 rounded-full bg-[#19A5A2] text-white flex items-center justify-center">
            {userName ? userName[0].toUpperCase() : "U"}
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Interview Status Banner */}
          {isInterviewEnded && (
            <div className="bg-yellow-600 text-white p-3 rounded-lg mb-4 text-center">
              This interview has ended. You can view your results in the dashboard.
            </div>
          )}

          {/* Video Container */}
          <div
            className={`flex-1 ${layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4"}`}
          >
            {/* Screen Share (if active) */}
            {isScreenSharing && screenStream && (
              <div className="col-span-full row-span-full bg-black rounded-lg overflow-hidden aspect-video relative">
                <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded">Screen Share</div>
              </div>
            )}

            {/* Candidate Video */}
            {(!minimizedVideo || minimizedVideo !== "user") && (
              <div
                className={`bg-black rounded-lg overflow-hidden aspect-video relative ${
                  pinnedVideo === "user" ? "col-span-full row-span-full" : ""
                }`}
              >
                {isCameraOn ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-white text-3xl">
                      {userName ? userName[0].toUpperCase() : "U"}
                    </div>
                  </div>
                )}

                {/* User name overlay */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded flex items-center">
                  <span className="mr-2">{userName} (You)</span>

                  {/* Audio level indicator */}
                  {isMicOn && (
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full ${audioLevel > i * 20 ? "bg-green-500" : "bg-gray-600"}`}
                          style={{ height: `${8 + i * 2}px` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Video controls */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-black/30 text-white rounded-full h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePinVideo("user")}>
                        <Pin className="h-4 w-4 mr-2" />
                        {pinnedVideo === "user" ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleMinimizeVideo("user")}>
                        {minimizedVideo === "user" ? (
                          <>
                            <Maximize className="h-4 w-4 mr-2" />
                            Maximize
                          </>
                        ) : (
                          <>
                            <Minimize className="h-4 w-4 mr-2" />
                            Minimize
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Interviewer Video (AI) */}
            {(!minimizedVideo || minimizedVideo !== "ai") && (
              <div
                className={`bg-black rounded-lg overflow-hidden aspect-video relative ${
                  pinnedVideo === "ai" ? "col-span-full row-span-full" : ""
                }`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center text-white text-3xl relative">
                    AI
                    {isAiSpeaking && <VoiceAnimation isActive={true} size={80} />}
                  </div>
                </div>

                {/* Interviewer name overlay */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded">
                  InterviewAI Assistant
                </div>

                {/* Video controls */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-black/30 text-white rounded-full h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePinVideo("ai")}>
                        <Pin className="h-4 w-4 mr-2" />
                        {pinnedVideo === "ai" ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleMinimizeVideo("ai")}>
                        {minimizedVideo === "ai" ? (
                          <>
                            <Maximize className="h-4 w-4 mr-2" />
                            Maximize
                          </>
                        ) : (
                          <>
                            <Minimize className="h-4 w-4 mr-2" />
                            Minimize
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Minimized videos */}
            {minimizedVideo && (
              <div className="absolute bottom-20 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                {minimizedVideo === "user" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg">
                      {userName ? userName[0].toUpperCase() : "U"}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-lg relative">
                      AI
                      {isAiSpeaking && <VoiceAnimation isActive={true} size={40} />}
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 bg-black/50 text-white rounded-full"
                  onClick={() => setMinimizedVideo(null)}
                >
                  <Maximize className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 flex justify-center space-x-4">
            <Button
              variant={isMicOn ? "outline" : "destructive"}
              size="icon"
              className={`rounded-full h-12 w-12 ${isMicOn ? "bg-gray-700 text-white hover:bg-gray-600" : ""}`}
              onClick={toggleMic}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isCameraOn ? "outline" : "destructive"}
              size="icon"
              className={`rounded-full h-12 w-12 ${isCameraOn ? "bg-gray-700 text-white hover:bg-gray-600" : ""}`}
              onClick={toggleCamera}
            >
              {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? "destructive" : "outline"}
              size="icon"
              className={`rounded-full h-12 w-12 ${!isScreenSharing ? "bg-gray-700 text-white hover:bg-gray-600" : ""}`}
              onClick={toggleScreenShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={`rounded-full h-12 w-12 ${
                activePanel === "chat"
                  ? "bg-[#19A5A2] text-white hover:bg-[#19A5A2]/90"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              onClick={() => togglePanel("chat")}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={`rounded-full h-12 w-12 ${
                activePanel === "participants"
                  ? "bg-[#19A5A2] text-white hover:bg-[#19A5A2]/90"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              onClick={() => togglePanel("participants")}
            >
              <Users className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={`rounded-full h-12 w-12 ${
                activePanel === "report"
                  ? "bg-[#19A5A2] text-white hover:bg-[#19A5A2]/90"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              onClick={() => togglePanel("report")}
            >
              <FileText className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 bg-gray-700 text-white hover:bg-gray-600"
              onClick={toggleLayout}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>

            <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={endCall}>
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Side Panels */}
        {activePanel === "chat" && (
          <ChatPanel
            isOpen={activePanel === "chat"}
            onClose={() => setActivePanel(null)}
            userName={userName}
            conversation={conversation}
            onSendMessage={handleAnswerSubmit}
            isInterviewActive={isInterviewActive}
          />
        )}

        {activePanel === "participants" && (
          <ParticipantsPanel
            isOpen={activePanel === "participants"}
            onClose={() => setActivePanel(null)}
            userName={userName}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
          />
        )}

        {activePanel === "report" && (
          <ReportPanel
            isOpen={activePanel === "report"}
            onClose={() => setActivePanel(null)}
            conversation={conversation}
            jobRole={jobRole}
          />
        )}
      </main>
    </div>
  )
}

