"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Plus, FileText, Calendar, Loader2 } from "lucide-react"
import DrawingCard from "./DrawingCard"
import { Axios } from "../ApiFormat"

export interface elementProps {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  angle: number
  strokeColor: string
  backgroundColor: string
  fillStyle: string
  strokeWidth: number
  strokeStyle: string
  roughness: number
  opacity: number
  groupIds: string[]
  frameId: null
  index: string
  roundness: Roundness
  seed: number
  version: number
  versionNonce: number
  isDeleted: boolean
  updated: number
  link: null
  locked: boolean
  boundElements?: { id: string; type: string }[] | null
}

export interface Roundness {
  type: number
}

export interface Drawing {
  createdAt: Date
  _id: string
  title: string
  elements: elementProps[]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [drawings, setDrawings] = useState<Drawing[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const Fetchdrawings = async () => {
    setLoading(true)
    try {
      const { data } = await Axios.get("/api/get-drawings")
      console.log(data)
      setDrawings(data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Fetchdrawings()
  }, [])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-600 font-medium">Loading your drawings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Drawings</h1>
          <p className="text-slate-600 text-lg">Create and manage your digital artwork</p>
        </div>

        {/* Create New Drawing Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Create New Drawing</h2>
                <p className="text-slate-600">Start a new masterpiece from scratch</p>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Plus className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <DrawingCard />
          </div>
        </div>

        {/* Drawings Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Recent Drawings</h2>
            {drawings && drawings.length > 0 && (
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {drawings.length} drawing{drawings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {drawings && drawings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {drawings.map((drawing) => (
                <div
                  key={drawing._id}
                  onClick={() => navigate(`/draw?id=${drawing._id}`)}
                  className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-indigo-200 transition-all duration-200 transform hover:-translate-y-1"
                >
                  {/* Drawing Preview Area */}
                  <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg mb-4 flex items-center justify-center group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors duration-200">
                    <FileText className="h-8 w-8 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200" />
                  </div>

                  {/* Drawing Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 truncate">
                      {drawing.title}
                    </h3>

                    <div className="flex items-center text-sm text-slate-500 space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(drawing.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {drawing.elements.length} element{drawing.elements.length !== 1 ? "s" : ""}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No drawings yet</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                You haven't created any drawings yet. Start by creating your first masterpiece!
              </p>
              <button
                onClick={() => navigate("/draw")}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Drawing</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
