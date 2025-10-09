import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Users,
  Save,
  Trash2,
  Share2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { deleteCookie, getCookie, setCookie } from "@/utils/AddCookie";
import { CollaborativeUser } from "@/types/Types";

const formatLastSaved = (date: Date) => {
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffMinutes === 0) return "just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffMinutes < 24 * 60) {
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  const diffDays = Math.floor(diffMinutes / (24 * 60));
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

interface CollaborationHeaderProps {
  onCollaborateStart: (status: boolean) => void;
  navigate: (path: string) => void;
  saving: boolean;
  lastSaved: Date | null;
  isConnected: boolean;
  connectedUsers: CollaborativeUser[];
  clearCanvasForAll: () => void;
  isDeletable?: boolean;
  setShowDeleteConfirm?: (show: boolean) => void;
  shareLink: string;
}

export default function CustomHeader({
  isDeletable = true,
  navigate = () => console.log("Navigating..."),
  saving = false,
  lastSaved = new Date(),
  isConnected = true,
  connectedUsers = [],
  clearCanvasForAll = () => alert("Canvas cleared!"),
  setShowDeleteConfirm = (show: boolean) => alert(`Show delete confirm: ${show}`),
  shareLink = "https://v0.dev/drawing/example-id",
  onCollaborateStart,
}: CollaborationHeaderProps) {
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [isCollabrating, setIsCollabrating] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const usersListRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess("Copied!");
    } catch (err) {
      setCopySuccess("Failed to copy!");
      console.error("Failed to copy: ", err);
    }
  };

  // FIX: Check collaboration status on mount
  useEffect(() => {
    const isCollab = getCookie("collaborating");
    console.log("Initial collaboration status:", isCollab);
    if (isCollab) {
      setIsCollabrating(true);
    }
  }, []);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (usersListRef.current && !usersListRef.current.contains(event.target as Node)) {
        setShowUsersList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [usersListRef]);

  // FIX: Handle starting collaboration session
  const handleStartCollaboration = () => {
    console.log("Starting collaboration session");
    setIsCollabrating(true);
    setCookie("collaborating", "true", 7); // Store as string
    setShowCollaborateModal(false);
    
    // Notify parent component to initialize socket
    onCollaborateStart(true);
    
    // Force page reload to initialize socket connection
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // FIX: Handle stopping collaboration session
  const handleStopCollaboration = () => {
    console.log("Stopping collaboration session");
    setIsCollabrating(false);
    deleteCookie("collaborating");
    setShowCollaborateModal(false);
    
    // Notify parent component
    onCollaborateStart(false);
    
    // Force page reload to disconnect socket
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <header className="bg-gradient-to-bl from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-xl relative z-40">
      {/* Left section: Navigation + Title + Save Status */}
      <div className="flex items-center gap-5 min-w-0">
        <motion.button
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/70 hover:bg-blue-600/80 rounded-xl shadow transition-colors duration-200"
          whileHover={{ scale: 1.12 }}
          onClick={() => navigate("/dashboard")}
          title="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.03, duration: 0.45, type: "spring", stiffness: 70 }}
          className="pr-3 md:pr-8 min-w-0"
        >
          <h1 className="text-2xl font-semibold text-white whitespace-nowrap overflow-ellipsis max-w-[20ch] tracking-tight mb-0.5">
            Untitled Drawing
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            {saving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Saved {formatLastSaved(lastSaved)}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Auto-save enabled
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Middle: Collaboration/Users */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* FIX: Show collaboration status */}
        {isCollabrating && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 shadow">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-300">Collaboration Active</span>
          </div>
        )}

        {/* User status/users list button - only show when collaborating */}
        {isCollabrating && (
          <div className="relative" ref={usersListRef}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowUsersList((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 backdrop-blur text-slate-300 shadow border border-slate-700/50 hover:border-blue-600 cursor-pointer transition duration-150"
              title="View connected users"
              tabIndex={0}
            >
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-emerald-400 animate-pulse" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isConnected ? "text-emerald-400" : "text-red-400"}`}>
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-300 font-medium">{connectedUsers.length}</span>
                <div className="flex -space-x-2">
                  {connectedUsers.slice(0, 3).map((user, i) => (
                    <motion.div
                      key={user.socketId || user.id + i}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.22 + i * 0.08, type: "spring", stiffness: 160 }}
                      className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-semibold text-white shadow"
                      style={{ backgroundColor: user.color }}
                      title={user.name}
                    >
                      {user.name?.charAt(0) || "U"}
                    </motion.div>
                  ))}
                  {connectedUsers.length > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-600 flex items-center justify-center text-xs text-white font-semibold">
                      +{connectedUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
            {/* User list dropdown w/ animation */}
            <AnimatePresence>
              {showUsersList && connectedUsers.length > 0 && (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, y: -14, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.19, type: "spring", damping: 16, stiffness: 140 }}
                  className="absolute top-full right-0 mt-3 w-72 md:w-80 bg-slate-800/95 border border-slate-600 rounded-xl shadow-2xl z-40 p-4 backdrop-blur"
                >
                  <h3 className="text-slate-200 font-bold text-base mb-3">Connected Users</h3>
                  <ul className="space-y-2">
                    {connectedUsers.map((user) => (
                      <li key={user.socketId || user.id} className="flex items-center gap-3 py-1">
                        <div
                          className="w-9 h-9 rounded-full border-2 border-slate-700 flex items-center justify-center text-sm font-medium text-white shadow"
                          style={{ backgroundColor: user.color }}
                          title={user.name ? user.name + (user.isVerified ? " (Verified)" : user.isAdmin ? " (Admin)" : "") : ""}
                        >
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <span className="flex-1 truncate text-slate-200 font-semibold">{user.name || `User ${user.id}`}</span>
                        <span className={`text-xs font-medium ${user.isVerified ? "text-green-400" : user.isAdmin ? "text-pink-400" : ""}`}>
                          {user.isVerified ? "VERIFIED" : user.isAdmin ? "ADMIN" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Save indicator (visible md+ screens) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow text-sm font-semibold min-w-[96px] justify-center select-none">
          {saving ? (
            <span className="flex items-center gap-2 text-yellow-300">
              <Save className="h-4 w-4 animate-pulse" />
              Saving
            </span>
          ) : (
            <span className="flex items-center gap-2 text-lime-300">
              <CheckCircle className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Right section: Collaborate - Clear - Delete */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Collaborate button */}
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCollaborateModal(true)}
          className={`p-2 md:px-4 md:py-2 text-slate-200 rounded-xl font-medium flex items-center gap-2 shadow transition duration-150 ${
            isCollabrating
              ? "bg-gradient-to-br from-green-700 via-emerald-700 to-green-600 hover:from-green-800 hover:to-green-700"
              : "bg-gradient-to-br from-blue-700 via-sky-700 to-blue-600 hover:from-blue-800 hover:to-blue-700"
          }`}
          title={isCollabrating ? "Collaboration active - click to manage" : "Start collaboration"}
        >
          <Share2 className="h-5 w-5" />
          <span className="hidden md:inline">{isCollabrating ? "Active" : "Collaborate"}</span>
        </motion.button>

        {/* Clear All - only show when collaborating */}
        {isCollabrating && (
          <motion.button
            whileHover={{ scale: 1.06 }}
            className="p-2 md:px-3 md:py-2 text-yellow-300 bg-slate-800/70 hover:bg-yellow-500/10 rounded-xl font-semibold flex items-center gap-2 shadow transition duration-150 border border-yellow-300/20"
            onClick={clearCanvasForAll}
            title="Clear canvas for everyone"
          >
            Clear All
          </motion.button>
        )}

        {/* Delete Button */}
        {isDeletable && (
          <motion.button
            whileHover={{ scale: 1.06 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 md:px-3 md:py-2 text-rose-400 bg-slate-800/60 hover:bg-rose-600/20 rounded-xl font-semibold flex items-center gap-2 shadow transition duration-150 border border-rose-400/20"
            title="Delete drawing"
          >
            <Trash2 className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Collaborate Modal */}
      <AnimatePresence>
        {showCollaborateModal && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCollaborateModal(false)}
          >
            <motion.div
              key="modal"
              initial={{ y: -36, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 150, damping: 18, duration: 0.38 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-7 w-full max-w-md border border-slate-700 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCollaborateModal(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3 text-center tracking-tight">
                {isCollabrating ? "Collaboration Active" : "Start Collaboration"}
              </h2>
              
              {isCollabrating ? (
                <>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-5">
                    <p className="text-green-400 text-sm font-medium text-center flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Your collaboration session is active
                    </p>
                  </div>
                  <p className="text-slate-300 mb-5 text-center">
                    Share this link with others to collaborate in real-time on this drawing.
                  </p>
                </>
              ) : (
                <p className="text-slate-300 mb-5 text-center">
                  Start a collaboration session and share the link with others to draw together in real-time.
                </p>
              )}

              <motion.div
                className="flex items-center gap-2 mb-6"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.19, duration: 0.29 }}
              >
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  placeholder="Collaboration link"
                  title="Collaboration link"
                  className="flex-1 p-3 border border-slate-600 rounded-md bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs md:text-sm"
                />
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold text-xs transition shadow"
                >
                  {copySuccess || "Copy"}
                </motion.button>
              </motion.div>

              <div className="flex justify-center gap-3">
                {isCollabrating ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={handleStopCollaboration}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-sm flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    End Collaboration
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={handleStartCollaboration}
                    className="px-6 py-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition shadow-sm flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Start Collaboration
                  </motion.button>
                )}
              </div>

              {copySuccess && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm text-center mt-4 font-medium ${
                    copySuccess === "Copied!" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {copySuccess}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}