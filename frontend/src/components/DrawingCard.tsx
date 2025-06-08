"use client"

import { Button, Description, Dialog, DialogPanel, DialogTitle, Field, Input, Label } from "@headlessui/react"
import { useState } from "react"
import clsx from "clsx"
import { useNavigate } from "react-router"
import { Axios } from "@/ApiFormat"
import { useForm } from "react-hook-form"
import { Plus, Loader2, Palette, Sparkles } from "lucide-react"
import { toast } from "react-toastify"

interface formProps {
  title: string
}

export default function DrawingCard() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<formProps>()

  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    reset()
  }

  const createDrawing = async (data: formProps) => {
    if (!data.title.trim()) {
      toast.error("Please enter a drawing name", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await Axios.post("/api/create-drawing", data)
      console.log(response)
      toast.success("Drawing created successfully!", {
        position: "top-right",
        autoClose: 2000,
      })
      close()
      navigate(`/draw?id=${response.data.data._id}`)
    } catch (error) {
      console.log(error)
      toast.error("Failed to create drawing. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {/* Create Drawing Button */}
      <div className="group">
        <Button
          onClick={open}
          className="relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-300"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold">Create New Drawing</div>
              <div className="text-sm text-indigo-100">Start your masterpiece</div>
            </div>
            <Sparkles className="h-5 w-5 text-indigo-200 group-hover:text-white transition-colors" />
          </div>
        </Button>
      </div>

      {/* Create Drawing Modal */}
      <Dialog open={isOpen} as="div" className="relative z-50 focus:outline-none" onClose={close}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-slate-200"
            >
              <form onSubmit={handleSubmit(createDrawing)} className="p-6">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle as="h3" className="text-xl font-semibold text-slate-900">
                      Create New Drawing
                    </DialogTitle>
                    <p className="text-sm text-slate-600">Give your artwork a memorable name</p>
                  </div>
                </div>

                {/* Form Field */}
                <Field className="mb-6">
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Drawing Name</Label>
                  <Description className="text-sm text-slate-500 mb-3">
                    Choose a name that describes your creative vision
                  </Description>
                  <Input
                    {...register("title", {
                      required: "Drawing name is required",
                      minLength: {
                        value: 1,
                        message: "Drawing name cannot be empty",
                      },
                      maxLength: {
                        value: 50,
                        message: "Drawing name must be less than 50 characters",
                      },
                    })}
                    placeholder="My Amazing Drawing"
                    className={clsx(
                      "w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                      "transition-colors duration-200",
                      errors.title && "border-red-300 focus:ring-red-500 focus:border-red-500",
                    )}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.title.message}</span>
                    </p>
                  )}
                </Field>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={close}
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Drawing</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-900">Pro Tip</p>
                      <p className="text-sm text-indigo-700">
                        Your drawing will auto-save as you work, so you never lose your progress!
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}
