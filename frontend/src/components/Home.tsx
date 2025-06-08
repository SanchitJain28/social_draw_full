"use client"

import { useEffect, useState } from "react"
import { NavLink } from "react-router"
import { Axios } from "../ApiFormat"
import Info from "./Info"
import { ArrowRight, Brush, Users, Share2, Loader2, ChevronDown } from "lucide-react"

export interface User {
  _id: string
  name: string
  email: string
  password: string
  profilePic: string
  PhoneNo: string
  createdAt: Date
}

export default function LandingPage() {
  const [user, setUser] = useState<null | User>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const refreshAccessToken = async () => {
    try {
      const response = await Axios.post("/api/refresh-access-token")
      console.log(response)
      console.log("token refreshed")
    } catch (error) {
      console.log(error)
      console.log("error in refreshing token")
    }
  }

  const getUser = async () => {
    setLoading(true)
    try {
      const response = await Axios.get("/api/get-user")
      console.log(response.data)
      setUser(response.data.data)
    } catch (error) {
      console.log(error)
      try {
        await refreshAccessToken()
        const response = await Axios.get("/api/get-user")
        setUser(response.data.data)
      } catch (error) {
        console.log(error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-lg font-medium text-indigo-900">Loading your creative space...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brush className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-indigo-900">SocialDraw</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <NavLink to="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Dashboard
                </NavLink>
                <NavLink to="/gallery" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Gallery
                </NavLink>
                <NavLink to="/community" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Community
                </NavLink>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-indigo-900 font-medium">Welcome back,</p>
                  <p className="text-indigo-600 font-semibold">{user.name}</p>
                </div>
                {user.profilePic ? (
                  <img
                    src={user.profilePic || "/placeholder.svg"}
                    alt={`${user.name}'s profile`}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-indigo-700 font-medium text-sm">
                      {user.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLink to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded-lg">
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign up
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-900 leading-tight">
              Draw Together, <span className="text-indigo-600">Create Together</span>
            </h1>
            <p className="mt-6 text-lg text-indigo-800 max-w-lg">
              SocialDraw brings friends and artists together in a collaborative drawing space. Create, share, and
              explore artwork in real-time with people around the world.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <NavLink
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              ) : (
                <NavLink
                  to="/signup"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get started for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              )}
              <a
                href="#features"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-200"
              >
                Learn more
                <ChevronDown className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-indigo-200 rounded-lg transform rotate-6"></div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-purple-200 rounded-lg transform -rotate-6"></div>
              <div className="relative z-10 bg-white p-4 rounded-xl shadow-xl">
                <img
                  src="/placeholder.svg?height=400&width=500"
                  alt="SocialDraw Canvas"
                  className="rounded-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Info />
      </div>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-3xl shadow-sm my-12"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-indigo-900">Why Choose SocialDraw?</h2>
          <p className="mt-4 text-lg text-indigo-700 max-w-2xl mx-auto">
            Our platform offers unique features designed to make collaborative drawing fun and easy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-indigo-50 p-8 rounded-xl">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <Brush className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-3">Intuitive Drawing Tools</h3>
            <p className="text-indigo-700">
              Our easy-to-use drawing tools make creating digital art accessible to everyone, from beginners to
              professionals.
            </p>
          </div>

          <div className="bg-purple-50 p-8 rounded-xl">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-purple-900 mb-3">Real-time Collaboration</h3>
            <p className="text-purple-700">
              Draw together with friends in real-time, no matter where they are in the world. See changes instantly as
              they happen.
            </p>
          </div>

          <div className="bg-indigo-50 p-8 rounded-xl">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <Share2 className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-3">Easy Sharing</h3>
            <p className="text-indigo-700">
              Share your creations with the community or keep them private. Export in multiple formats for use anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-indigo-900">What Our Users Say</h2>
          <p className="mt-4 text-lg text-indigo-700">Join thousands of satisfied artists using SocialDraw</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">JD</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-indigo-900">Jane Doe</h4>
                <p className="text-sm text-indigo-600">Digital Artist</p>
              </div>
            </div>
            <p className="text-indigo-800">
              "SocialDraw has transformed how I collaborate with clients. The real-time feedback makes the revision
              process so much smoother!"
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-medium">MS</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-indigo-900">Mike Smith</h4>
                <p className="text-sm text-indigo-600">Art Teacher</p>
              </div>
            </div>
            <p className="text-indigo-800">
              "My students love using SocialDraw for group projects. It's intuitive enough for beginners but powerful
              enough for advanced techniques."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">AL</span>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-indigo-900">Alex Lee</h4>
                <p className="text-sm text-indigo-600">Hobbyist</p>
              </div>
            </div>
            <p className="text-indigo-800">
              "I've made so many friends through SocialDraw's community. It's not just a drawing tool, it's a social
              platform for artists!"
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Creating?</h2>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-8">
            Join our community of artists and start creating amazing artwork together today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <NavLink
                to="/dashboard"
                className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Go to your dashboard
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/signup"
                  className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Sign up for free
                </NavLink>
                <NavLink
                  to="/login"
                  className="px-8 py-3 bg-white/20 text-white border border-white/30 font-medium rounded-lg hover:bg-white/30 transition-colors"
                >
                  Log in
                </NavLink>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brush className="h-4 w-4 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-indigo-900">SocialDraw</span>
            </div>
            <p className="mt-4 text-indigo-700">Bringing artists together through collaborative drawing.</p>
          </div>

          <div>
            <h4 className="font-semibold text-indigo-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Updates
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-indigo-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-indigo-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-indigo-100 mt-12 pt-8 text-center text-indigo-600">
          <p>&copy; {new Date().getFullYear()} SocialDraw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
