"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Video, VideoOff, Settings, MoreVertical } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

export default function JoinMeeting() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("")
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("")
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    // Get user info and query params
    const user = auth.currentUser
    const searchParams = new URLSearchParams(window.location.search)
    const role = searchParams.get("role")

    if (!role) {
      toast({
        title: "Missing Information",
        description: "Job role information is missing.",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    if (user) {
      setUserName(user.displayName || "Candidate")
      setUserEmail(user.email)
    } else {
      router.push("/login/student")
    }

    // Get available devices
    const getDevices = async () => {
      try {
        // Request permissions first
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter((device) => device.kind === "audioinput")
        const videoInputs = devices.filter((device) => device.kind === "videoinput")

        setAudioDevices(audioInputs)
        setVideoDevices(videoInputs)

        if (audioInputs.length > 0) {
          setSelectedAudioDevice(audioInputs[0].deviceId)
        }

        if (videoInputs.length > 0) {
          setSelectedVideoDevice(videoInputs[0].deviceId)
        }
      } catch (error) {
        console.error("Error getting devices:", error)
        toast({
          title: "Permission Error",
          description: "Please allow camera and microphone access to join the meeting.",
          variant: "destructive",
        })
      }
    }

    getDevices()

    return () => {
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [router, toast])

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

  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn off camera
      if (stream) {
        const videoTracks = stream.getVideoTracks()
        videoTracks.forEach((track) => track.stop())

        // Keep only audio tracks
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length > 0) {
          const audioStream = new MediaStream(audioTracks)
          setStream(audioStream)
        } else {
          setStream(null)
        }
      }
      setIsCameraOn(false)
    } else {
      // Turn on camera
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? { deviceId: selectedVideoDevice } : true,
          audio: isMicOn ? (selectedAudioDevice ? { deviceId: selectedAudioDevice } : true) : false,
        })

        // If we already have a stream with audio, we need to merge them
        if (stream && isMicOn) {
          const audioTracks = stream.getAudioTracks()
          audioTracks.forEach((track) => newStream.addTrack(track))
        }

        setStream(newStream)
        setIsCameraOn(true)

        // Set video element's srcObject
        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please check permissions.",
          variant: "destructive",
        })
      }
    }
  }

  const toggleMic = async () => {
    if (isMicOn) {
      // Turn off mic
      if (stream) {
        const audioTracks = stream.getAudioTracks()
        audioTracks.forEach((track) => track.stop())

        // Keep only video tracks if camera is on
        if (isCameraOn) {
          const videoTracks = stream.getVideoTracks()
          if (videoTracks.length > 0) {
            const videoStream = new MediaStream(videoTracks)
            setStream(videoStream)
          } else {
            setStream(null)
          }
        } else {
          setStream(null)
        }
      }
      setIsMicOn(false)
    } else {
      // Turn on mic
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedAudioDevice ? { deviceId: selectedAudioDevice } : true,
          video: isCameraOn ? (selectedVideoDevice ? { deviceId: selectedVideoDevice } : true) : false,
        })

        // If we already have a stream with video, we need to merge them
        if (stream && isCameraOn) {
          const videoTracks = stream.getVideoTracks()
          videoTracks.forEach((track) => newStream.addTrack(track))
        }

        setStream(newStream)
        setIsMicOn(true)

        // Set video element's srcObject if camera is on
        if (isCameraOn && videoRef.current) {
          videoRef.current.srcObject = newStream
        }
      } catch (error) {
        console.error("Error accessing microphone:", error)
        toast({
          title: "Microphone Error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive",
        })
      }
    }
  }

  const handleAudioDeviceChange = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId)

    if (isMicOn && stream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId },
          video: false,
        })

        // Replace audio tracks
        const oldAudioTracks = stream.getAudioTracks()
        oldAudioTracks.forEach((track) => {
          stream.removeTrack(track)
          track.stop()
        })

        const newAudioTracks = newStream.getAudioTracks()
        newAudioTracks.forEach((track) => stream.addTrack(track))

        setStream(stream)
      } catch (error) {
        console.error("Error changing audio device:", error)
      }
    }
  }

  const handleVideoDeviceChange = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId)

    if (isCameraOn && stream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: false,
        })

        // Replace video tracks
        const oldVideoTracks = stream.getVideoTracks()
        oldVideoTracks.forEach((track) => {
          stream.removeTrack(track)
          track.stop()
        })

        const newVideoTracks = newStream.getVideoTracks()
        newVideoTracks.forEach((track) => stream.addTrack(track))

        setStream(stream)

        // Update video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error changing video device:", error)
      }
    }
  }

  const handleJoinMeeting = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const role = searchParams.get("role") || ""
    router.push(`/meeting/room?role=${encodeURIComponent(role)}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-[#19A5A2]">InterviewAI</h1>
        </div>
        <div className="flex items-center">
          <span className="mr-2">{userEmail}</span>
          <div className="w-10 h-10 rounded-full bg-[#19A5A2] text-white flex items-center justify-center">
            {userName ? userName[0].toUpperCase() : "C"}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {/* Video Preview */}
          <div className="bg-black rounded-lg overflow-hidden aspect-video relative mb-4">
            {isCameraOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-white text-3xl">
                  {userName ? userName[0].toUpperCase() : "C"}
                </div>
              </div>
            )}

            {/* User name overlay */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded">
              {userName || "Candidate"}
            </div>

            {/* Audio level indicator */}
            {isMicOn && (
              <div className="absolute bottom-4 left-[120px] flex items-center space-x-1">
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

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant={isMicOn ? "default" : "destructive"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleMic}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isCameraOn ? "default" : "destructive"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleCamera}
            >
              {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Device Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Microphone</label>
              <Select value={selectedAudioDevice} onValueChange={handleAudioDeviceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.substring(0, 5)}...`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Camera</label>
              <Select value={selectedVideoDevice} onValueChange={handleVideoDeviceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.substring(0, 5)}...`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Join Panel */}
        <Card className="w-full md:w-80 p-6 self-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Ready to join?</h2>
              <p className="text-gray-500">Your interview is about to begin</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Interview details:</p>
              <p className="font-medium">Frontend Developer Position</p>
              <p className="text-sm text-gray-500">Scheduled for today</p>
            </div>

            <Button className="w-full bg-[#19A5A2] hover:bg-[#19A5A2]/90" onClick={handleJoinMeeting}>
              Join now
            </Button>

            <p className="text-xs text-center text-gray-500">By joining, you agree to our terms and conditions</p>
          </div>
        </Card>
      </main>
    </div>
  )
}

