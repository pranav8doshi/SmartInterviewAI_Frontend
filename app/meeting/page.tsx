"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  HandIcon as HandRaised,
  Subtitles,
  PhoneOff,
  Info,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react"
import { ParticipantsPanel } from "./components/participants-panel"
import { ChatPanel } from "./components/chat-panel"
import { MeetingInfo } from "./components/meeting-info"
import { MoreOptionsMenu } from "./components/more-options-menu"
import { ReactionsMenu } from "./components/reactions-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MeetingRoom() {
  const [isSetup, setIsSetup] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [showReaction, setShowReaction] = useState<string | null>(null)
  const [handRaised, setHandRaised] = useState(false)
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [activePanel, setActivePanel] = useState<"info" | "people" | "chat" | null>(null)
  const reactionTimeoutRef = useRef<NodeJS.Timeout>()
  const meetingId = "ojq-mkou-xiz"

  const [devices, setDevices] = useState<{
    videoDevices: MediaDeviceInfo[]
    audioDevices: MediaDeviceInfo[]
    audioOutputDevices: MediaDeviceInfo[]
  }>({
    videoDevices: [],
    audioDevices: [],
    audioOutputDevices: [],
  })

  const [selectedDevices, setSelectedDevices] = useState({
    videoDeviceId: "",
    audioDeviceId: "",
    audioOutputDeviceId: "",
  })

  const [joinWithoutDevices, setJoinWithoutDevices] = useState(false)

  useEffect(() => {
    // Get available media devices
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        setDevices({
          videoDevices: devices.filter((device) => device.kind === "videoinput"),
          audioDevices: devices.filter((device) => device.kind === "audioinput"),
          audioOutputDevices: devices.filter((device) => device.kind === "audiooutput"),
        })
      } catch (err) {
        console.error("Error accessing media devices:", err)
      }
    }
    getDevices()
  }, [])

  useEffect(() => {
    if (!joinWithoutDevices && isSetup) {
      requestMediaPermissions()
    }
  }, [joinWithoutDevices, isSetup])

  const requestMediaPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: selectedDevices.videoDeviceId ? { deviceId: selectedDevices.videoDeviceId } : true,
        audio: selectedDevices.audioDeviceId ? { deviceId: selectedDevices.audioDeviceId } : true,
      })
      setStream(mediaStream)
      setIsAudioEnabled(true)
      setIsVideoEnabled(true)
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  const handleJoinMeeting = () => {
    if (joinWithoutDevices) {
      setIsAudioEnabled(false)
      setIsVideoEnabled(false)
    }
    setIsSetup(false)
  }

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled
      })
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const handleReaction = (reaction: string) => {
    setShowReaction(reaction)
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current)
    }
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReaction(null)
    }, 3000)
  }

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      })
      // Handle screen sharing stream
      console.log("Screen sharing started", screenStream)
    } catch (error) {
      console.error("Error sharing screen:", error)
    }
  }

  if (isSetup) {
    return (
      <div className="min-h-screen bg-[#202124] text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium">Ready to join?</h1>
            <p className="text-[#9aa0a6] mt-2">ojq-mkou-xiz</p>
          </div>

          <div className="grid md:grid-cols-[2fr,1fr] gap-8">
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="aspect-video bg-[#3c4043] rounded-lg overflow-hidden relative">
                {stream && isVideoEnabled ? (
                  <video
                    autoPlay
                    playsInline
                    muted
                    ref={(videoElement) => {
                      if (videoElement) {
                        videoElement.srcObject = stream
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center text-3xl">
                      V
                    </div>
                  </div>
                )}

                {/* Camera/Mic Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-12 h-12 ${
                      !isAudioEnabled ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] hover:bg-[#4a4d51]"
                    }`}
                    onClick={toggleAudio}
                  >
                    {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-12 h-12 ${
                      !isVideoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] hover:bg-[#4a4d51]"
                    }`}
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Join Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-[#3c4043] hover:bg-[#4a4d51]"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  className="bg-[#8ab4f8] hover:bg-[#93baf9] text-[#202124] px-6 rounded-full h-12"
                  onClick={handleJoinMeeting}
                >
                  Join now
                </Button>
              </div>
            </div>

            <div className="bg-[#3c4043] rounded-lg p-6">
              <h2 className="font-medium mb-4">People</h2>
              <div className="flex items-center gap-3 p-3 hover:bg-[#4a4d51] rounded-lg cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#5f6368] flex items-center justify-center">V</div>
                <div>
                  <p className="font-medium">You</p>
                  <p className="text-sm text-[#9aa0a6]">Meeting host</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-[#3c4043] text-white border-[#4a4d51] max-w-2xl">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg">Audio</Label>
                <RadioGroup
                  value={selectedDevices.audioDeviceId}
                  onValueChange={(value) => {
                    setSelectedDevices((prev) => ({ ...prev, audioDeviceId: value }))
                    requestMediaPermissions()
                  }}
                >
                  {devices.audioDevices.map((device) => (
                    <div key={device.deviceId} className="flex items-center space-x-2 bg-[#202124] p-3 rounded-md">
                      <RadioGroupItem value={device.deviceId} id={device.deviceId} />
                      <Label htmlFor={device.deviceId}>{device.label || `Microphone ${device.deviceId}`}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator className="bg-[#4a4d51]" />

              <div className="space-y-4">
                <Label className="text-lg">Video</Label>
                <RadioGroup
                  value={selectedDevices.videoDeviceId}
                  onValueChange={(value) => {
                    setSelectedDevices((prev) => ({ ...prev, videoDeviceId: value }))
                    requestMediaPermissions()
                  }}
                >
                  {devices.videoDevices.map((device) => (
                    <div key={device.deviceId} className="flex items-center space-x-2 bg-[#202124] p-3 rounded-md">
                      <RadioGroupItem value={device.deviceId} id={device.deviceId} />
                      <Label htmlFor={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator className="bg-[#4a4d51]" />

              <div className="space-y-4">
                <Label className="text-lg">Speakers</Label>
                <RadioGroup
                  value={selectedDevices.audioOutputDeviceId}
                  onValueChange={(value) => setSelectedDevices((prev) => ({ ...prev, audioOutputDeviceId: value }))}
                >
                  {devices.audioOutputDevices.map((device) => (
                    <div key={device.deviceId} className="flex items-center space-x-2 bg-[#202124] p-3 rounded-md">
                      <RadioGroupItem value={device.deviceId} id={device.deviceId} />
                      <Label htmlFor={device.deviceId}>{device.label || `Speaker ${device.deviceId}`}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-[#202124] text-white overflow-hidden">
        <main className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {showReaction && <div className="text-6xl animate-bounce">{showReaction}</div>}
          </div>

          <div className="absolute inset-4 rounded-lg bg-[#3c4043] overflow-hidden">
            {stream && isVideoEnabled ? (
              <video
                autoPlay
                playsInline
                muted
                ref={(videoElement) => {
                  if (videoElement) {
                    videoElement.srcObject = stream
                  }
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center text-3xl">V</div>
              </div>
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#202124] p-2 rounded-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-10 h-10 ${
                    !isAudioEnabled ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] hover:bg-[#4a4d51]"
                  }`}
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isAudioEnabled ? "Turn off microphone" : "Turn on microphone"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-10 h-10 ${
                    !isVideoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] hover:bg-[#4a4d51]"
                  }`}
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isVideoEnabled ? "Turn off camera" : "Turn on camera"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 bg-[#3c4043] hover:bg-[#4a4d51]"
                  onClick={startScreenShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Present now</TooltipContent>
            </Tooltip>

            <ReactionsMenu onReaction={handleReaction} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-10 h-10 ${
                    handRaised ? "bg-[#8ab4f8] hover:bg-[#93baf9] text-[#202124]" : "bg-[#3c4043] hover:bg-[#4a4d51]"
                  }`}
                  onClick={() => setHandRaised(!handRaised)}
                >
                  <HandRaised className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{handRaised ? "Lower hand" : "Raise hand"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-10 h-10 ${
                    captionsEnabled
                      ? "bg-[#8ab4f8] hover:bg-[#93baf9] text-[#202124]"
                      : "bg-[#3c4043] hover:bg-[#4a4d51]"
                  }`}
                  onClick={() => setCaptionsEnabled(!captionsEnabled)}
                >
                  <Subtitles className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{captionsEnabled ? "Turn off captions" : "Turn on captions"}</TooltipContent>
            </Tooltip>

            <MoreOptionsMenu />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-red-500 hover:bg-red-600">
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Leave call</TooltipContent>
            </Tooltip>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 bg-[#3c4043] hover:bg-[#4a4d51]"
              onClick={() => setActivePanel(activePanel === "info" ? null : "info")}
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 bg-[#3c4043] hover:bg-[#4a4d51]"
              onClick={() => setActivePanel(activePanel === "people" ? null : "people")}
            >
              <div className="relative">
                <Users className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-[#8ab4f8] text-[#202124] text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 bg-[#3c4043] hover:bg-[#4a4d51]"
              onClick={() => setActivePanel(activePanel === "chat" ? null : "chat")}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </main>

        <div className="absolute top-0 right-0 h-full">
          <MeetingInfo isOpen={activePanel === "info"} onClose={() => setActivePanel(null)} meetingId={meetingId} />
          <ParticipantsPanel isOpen={activePanel === "people"} onClose={() => setActivePanel(null)} />
          <ChatPanel isOpen={activePanel === "chat"} onClose={() => setActivePanel(null)} />
        </div>

        <Dialog open={showStats} onOpenChange={setShowStats}>
          <DialogContent className="bg-[#3c4043] text-white border-[#4a4d51]">
            <DialogHeader>
              <DialogTitle>Call Statistics</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Call Latency</Label>
                <div className="text-sm text-[#9aa0a6]">45ms</div>
              </div>
              <div>
                <Label>Call Performance</Label>
                <div className="text-sm text-[#9aa0a6]">Excellent</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

