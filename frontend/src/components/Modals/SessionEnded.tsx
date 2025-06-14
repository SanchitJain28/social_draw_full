"use client"

import type React from "react"

interface SessionEndedModalProps {
  isOpen: boolean
  // onClose: () => void // Removed: Modal is no longer closeable by user
}

export const SessionEndedModal: React.FC<SessionEndedModalProps> = ({ isOpen }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }} // Transparent background and blur applied
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-3xl font-bold text-red-700 mb-3">Session Ended!</h2>
        <p className="text-gray-700 text-lg mb-6">The admin has left the drawing. Your session has ended.</p>
        {/* Removed the "OK" button as the modal is not closeable by the user */}
      </div>
    </div>
  )
}
