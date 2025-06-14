"use client"

import { useState, useEffect, useRef } from "react" // Added useRef
import { ArrowLeft, Loader2, CheckCircle, Clock, Wifi, WifiOff, Users, Save, Trash2, Share2, X } from "lucide-react"
import { deleteCookie, getCookie, setCookie } from "@/utils/AddCookie"
import { CollaborativeUser } from "@/types/Types";
// Helper function to format last saved time
const formatLastSaved = (date: Date) => {
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffMinutes === 0) {
    return "just now"
  } else if (diffMinutes === 1) {
    return "1 minute ago"
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`
  } else if (diffMinutes < 24 * 60) {
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else {
    const diffDays = Math.floor(diffMinutes / (24 * 60))
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }
}

interface CollaborationHeaderProps {
  onCollaborateStart: (status: boolean) => void
  navigate: (path: string) => void
  saving: boolean
  lastSaved: Date | null
  isConnected: boolean
  connectedUsers: CollaborativeUser[]
  clearCanvasForAll: () => void
  isDeletable?: boolean
  setShowDeleteConfirm?: (show: boolean) => void
  shareLink: string
}

export default function CustomHeader({
  isDeletable = true,
  navigate = () => console.log("Navigating..."),
  saving = false,
  lastSaved = new Date(),
  isConnected = true,
  connectedUsers = [
    { id: "1", name: "Alice", color: "#FF5733" ,isVerified:false,isAdmin:false,socketId:"" },
    { id: "2", name: "Bob", color: "#33FF57",isVerified:false ,isAdmin:false,socketId:""},
    { id: "3", name: "Charlie", color: "#3357FF" ,isVerified:false,isAdmin:false,socketId:""},
    { id: "4", name: "Diana", color: "#FF33F7",isVerified:false ,isAdmin:false,socketId:""},
  ],
  clearCanvasForAll = () => alert("Canvas cleared!"),
  setShowDeleteConfirm = (show: boolean) => alert(`Show delete confirm: ${show}`),
  shareLink = "https://v0.dev/drawing/example-id", // Default share link
  onCollaborateStart,
}: CollaborationHeaderProps) {
  const [showCollaborateModal, setShowCollaborateModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState("")
  const [isCollabrating, setIsCollabrating] = useState(false)
  const [showUsersList, setShowUsersList] = useState(false) // New state for user list visibility
  const usersListRef = useRef<HTMLDivElement>(null) // New ref for click outside detection

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopySuccess("Copied!")
    } catch (err) {
      setCopySuccess("Failed to copy!")
      console.error("Failed to copy: ", err)
    }
  }

  useEffect(() => {
    const isCollab = getCookie("collaborating")
    if (isCollab) {
      setIsCollabrating(true)
      onCollaborateStart?.(true)
    }
  }, [])

  // Handle copy message reset
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess("")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copySuccess])

  // Handle click outside to close user list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (usersListRef.current && !usersListRef.current.contains(event.target as Node)) {
        setShowUsersList(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [usersListRef])

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">{"Untitled Drawing"}</h1>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            {saving ? (
              <div className="flex items-center space-x-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Saved {formatLastSaved(lastSaved)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Auto-save enabled</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Collaboration Status and User List */}
        <div className="relative" ref={usersListRef}>
          {" "}
          {/* Added relative positioning and ref */}
          <button
            onClick={() => setShowUsersList(!showUsersList)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            title="View connected users"
          >
            <div className="flex items-center space-x-1">
              {isConnected ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span className={`text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}>
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>

            {connectedUsers.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-purple-400" /> {/* Changed indigo to purple */}
                <span className="text-sm text-purple-400">{connectedUsers.length}</span>
                <div className="flex -space-x-1">
                  {connectedUsers.map((user) => (
                    <div
                      key={user.socketId}
                      className="w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: user.color }}
                      title={user.name}
                    >
                      {user.name?.charAt(0) || "U"}
                    </div>
                  ))}
                  {connectedUsers.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-800 bg-slate-600 flex items-center justify-center text-xs text-white">
                      +{connectedUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>
          {showUsersList && connectedUsers.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 p-4">
              <h3 className="text-slate-200 font-semibold mb-2">Connected Users</h3>
              <ul className="space-y-2">
                {connectedUsers.map((user) => (
                  <li key={user.socketId} className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center text-sm font-medium text-white"
                      style={{ backgroundColor: user.color }}
                      title={user.name ? user.name + (user.isVerified ? "(Verified)" : "(Un-verified)") : ""}
                    >
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-slate-300">{user.name|| `User ${user.id}` }</span>
                    <span className="text-slate-300">{user.isVerified ?"VERIFIED": user.isAdmin ? "ADMIN":"" }</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Save Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2">
          {saving ? (
            <div className="flex items-center space-x-2 text-amber-400">
              <Save className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Saving</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
        </div>

        {/* Collaborate Button */}
        <button
          onClick={() => setShowCollaborateModal(true)}
          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1"
          title="Collaborate on this drawing"
        >
          <Share2 className="h-5 w-5" />
          <span className="hidden sm:inline">Collaborate</span>
        </button>

        {/* Clear Canvas Button */}
        <button
          onClick={clearCanvasForAll}
          className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors"
          title="Clear canvas for everyone"
        >
          Clear All
        </button>

        {/* Delete Button */}
        {isDeletable && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Delete drawing"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {showCollaborateModal && (
        <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md relative border border-slate-700">
            <button
              onClick={() => setShowCollaborateModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-700 transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Collaborate on this drawing</h2>
            <p className="text-slate-300 mb-6">Copy this link and share with others to collaborate on this drawing.</p>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {copySuccess || "Copy Link"}
              </button>
            </div>
            <div className="">
              {isCollabrating ? (
                <>
                  <button
                    onClick={() => {
                      onCollaborateStart(false) // <- Notify parent that collaboration started
                      deleteCookie("collaborating") // Remove cookie for collaboration
                      setIsCollabrating(false)
                      setShowCollaborateModal(false)
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    {"Stop session"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      console.log("isCoolab", isCollabrating)
                      setIsCollabrating(true)
                      onCollaborateStart(true) // <- Notify parent that collaboration started
                      setShowCollaborateModal(false)
                      setCookie("collaborating", true, 7) // Set cookie for collaboration
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {"Start session"}
                  </button>
                </>
              )}
            </div>
            {copySuccess && (
              <p className={`text-sm text-center ${copySuccess === "Copied!" ? "text-green-400" : "text-red-400"}`}>
                {copySuccess}
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
