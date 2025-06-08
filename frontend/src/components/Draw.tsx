"use client"

import { useEffect, useState } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import type { ExcalidrawInitialDataState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"
import "@excalidraw/excalidraw/index.css"
import { useDebounce } from "@uidotdev/usehooks"
import { ToastContainer, toast } from "react-toastify"
import { useNavigate, useSearchParams } from "react-router"
import { Axios } from "../ApiFormat"
import type { Drawing } from "./Dashboard"
import type { ExcalidrawElement, OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import { ArrowLeft, Trash2, Save, Loader2, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function Draw() {
const [, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const navigate = useNavigate()
  const [saving, setSaving] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const [initialDrawings, setInitialDrawings] = useState<ExcalidrawInitialDataState | null>(null)
  const [drawingData, setDrawingData] = useState<Drawing | null>(null)
  const [sceneElements, setSceneElements] = useState<readonly OrderedExcalidrawElement[] | null | undefined>()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedSceneElements = useDebounce(sceneElements, 1000)

  const deleteDrawing = async () => {
    try {
      const response = await Axios.delete(`/api/delete-drawing?id=${searchParams.get("id")}`)
      console.log(response)
      navigate("/dashboard")
      toast.success("Drawing deleted successfully", {
        position: "top-right",
        autoClose: 2000,
      })
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete drawing", {
        position: "top-right",
        autoClose: 3000,
      })
    }
    setShowDeleteConfirm(false)
  }

  const getDrawing = async () => {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { data },
      } = await Axios.get(`/api/single-drawing?id=${searchParams.get("id")}`)
      setDrawingData(data)
      setInitialDrawings(data.elements)
      setSceneElements(data.elements as readonly OrderedExcalidrawElement[] | null)
    } catch (error) {
      console.log(error)
      setError("Failed to load drawing. Please try again.")
      toast.error("Failed to load drawing", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOnchange = (elements: readonly ExcalidrawElement[] | null) => {
    setSceneElements(elements as readonly OrderedExcalidrawElement[] | null)
  }

  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }

  useEffect(() => {
    getDrawing()
  }, [])

  useEffect(() => {
    const updateDrawing = async () => {
      if (debouncedSceneElements && initialDrawings) {
        setSaving(true)
        try {
          const response = await Axios.post(`/api/update-drawing?id=${searchParams.get("id")}`, {
            drawings: debouncedSceneElements,
          })
          console.log(response)
          setLastSaved(new Date())
          toast.success("Drawing saved", {
            position: "bottom-right",
            autoClose: 1000,
            hideProgressBar: true,
          })
        } catch (error) {
          console.log(error)
          toast.error("Failed to save drawing", {
            position: "top-right",
            autoClose: 3000,
          })
        } finally {
          setSaving(false)
        }
      }
    }
    updateDrawing()
  }, [debouncedSceneElements])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
          <p className="text-lg font-medium text-slate-300">Loading your drawing...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={getDrawing}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
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
            <h1 className="text-lg font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
              {drawingData?.title || "Untitled Drawing"}
            </h1>
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

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Delete drawing"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        {initialDrawings && (
          <Excalidraw
            theme="dark"
            initialData={{
              elements: [...(Array.isArray(initialDrawings) ? initialDrawings : [])],
            }}
            excalidrawAPI={(api) => {
              console.log(api + "API")
              setExcalidrawAPI(api)
            }}
            onChange={handleOnchange}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Delete Drawing</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete "{drawingData?.title}"? This will permanently remove the drawing and all
              its content.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={deleteDrawing}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
          border: "1px solid #334155",
        }}
      />
    </div>
  )
}
