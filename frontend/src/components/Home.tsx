"use client"

import { useEffect, useState } from "react"
import { NavLink } from "react-router"
import { Axios } from "../ApiFormat"
import Info from "./Info"
import {
  ArrowRight,
  Brush,
  Users,
  Share2,
  Loader2,
  Palette,
  Zap,
  Heart,
  Star,
  Globe,
  Shield,
  Sparkles,
  Play,
} from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
          </div>
          <p className="text-lg font-medium text-indigo-900">Preparing your creative canvas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brush className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              SocialDraw
            </span>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <NavLink
                  to="/dashboard"
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Dashboard
                </NavLink>
                <NavLink to="/gallery" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  Gallery
                </NavLink>
                <NavLink
                  to="/community"
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
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
                    className="w-10 h-10 rounded-full border-2 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-medium text-sm">{user.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLink
                to="/login"
                className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Creating
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>
              <span className="text-sm text-indigo-700 font-medium">Loved by 50,000+ artists worldwide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-900 leading-tight">
              Where Art Meets{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Collaboration
              </span>
            </h1>
            <p className="mt-6 text-xl text-indigo-800 max-w-lg leading-relaxed">
              Transform your creative process with real-time collaborative drawing. Connect with artists globally, share
              ideas instantly, and bring your imagination to life together.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <NavLink
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Continue Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              ) : (
                <NavLink
                  to="/signup"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Start Creating Free
                  <Sparkles className="ml-2 h-5 w-5" />
                </NavLink>
              )}
              <button className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors border-2 border-indigo-200 hover:border-indigo-300">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            <div className="mt-8 flex items-center space-x-8 text-sm text-indigo-700">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>100% Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>No downloads required</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl transform rotate-6 opacity-60"></div>
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl transform -rotate-6 opacity-60"></div>
              <div className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl border border-indigo-100">
                <img
                  src="/placeholder.svg?height=400&width=500"
                  alt="SocialDraw collaborative canvas showing multiple users drawing together"
                  className="rounded-xl w-full h-auto"
                />
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  LIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100">
            <div className="text-3xl font-bold text-indigo-900">50K+</div>
            <div className="text-indigo-700 font-medium">Active Artists</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100">
            <div className="text-3xl font-bold text-indigo-900">1M+</div>
            <div className="text-indigo-700 font-medium">Drawings Created</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100">
            <div className="text-3xl font-bold text-indigo-900">150+</div>
            <div className="text-indigo-700 font-medium">Countries</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100">
            <div className="text-3xl font-bold text-indigo-900">99.9%</div>
            <div className="text-indigo-700 font-medium">Uptime</div>
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white rounded-3xl shadow-xl my-16 border border-indigo-100"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-indigo-900 mb-4">
            Everything You Need to Create <span className="text-purple-600">Together</span>
          </h2>
          <p className="text-xl text-indigo-700 max-w-3xl mx-auto">
            Professional-grade tools designed for seamless collaboration, whether you're sketching ideas or creating
            detailed artwork with your team.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Palette className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">Professional Drawing Tools</h3>
            <p className="text-indigo-700 leading-relaxed">
              Access a complete suite of drawing tools including brushes, shapes, layers, and advanced features. Perfect
              for everything from quick sketches to detailed illustrations.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Real-time Collaboration</h3>
            <p className="text-purple-700 leading-relaxed">
              See every stroke as it happens. Collaborate with unlimited team members in real-time, with live cursors
              and instant synchronization across all devices.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">Share & Export Anywhere</h3>
            <p className="text-indigo-700 leading-relaxed">
              Share your creations instantly with custom links, export in multiple formats (PNG, SVG, PDF), or publish
              to our community gallery for the world to see.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-indigo-900 mb-4">Loved by Creative Teams Worldwide</h2>
          <p className="text-xl text-indigo-700">See how SocialDraw is transforming creative collaboration</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold">JD</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-indigo-900">Jessica Davis</h4>
                <p className="text-sm text-indigo-600">UI/UX Designer at TechCorp</p>
              </div>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              "SocialDraw revolutionized our design process. Real-time collaboration with clients means faster
              iterations and better results. It's like having everyone in the same room!"
            </p>
            <div className="flex mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">MS</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-indigo-900">Marcus Thompson</h4>
                <p className="text-sm text-indigo-600">Art Teacher, Creative Academy</p>
              </div>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              "My students absolutely love SocialDraw! It's intuitive enough for beginners but powerful enough for
              advanced projects. The collaborative features make group work actually fun."
            </p>
            <div className="flex mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">AL</span>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-indigo-900">Anna Liu</h4>
                <p className="text-sm text-indigo-600">Freelance Illustrator</p>
              </div>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              "The community aspect is incredible! I've connected with artists from around the world, learned new
              techniques, and even found collaboration opportunities. It's more than a tool—it's a platform."
            </p>
            <div className="flex mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Something <span className="text-yellow-300">Amazing</span>?
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              Join thousands of artists, designers, and creative teams who are already using SocialDraw to bring their
              ideas to life. Start your creative journey today—completely free!
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {user ? (
                <NavLink
                  to="/dashboard"
                  className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                >
                  Open Your Canvas
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/signup"
                    className="px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
                  >
                    Start Creating Free
                  </NavLink>
                  <NavLink
                    to="/login"
                    className="px-10 py-4 bg-white/20 text-white border-2 border-white/30 font-bold rounded-xl hover:bg-white/30 transition-all text-lg"
                  >
                    Sign In
                  </NavLink>
                </>
              )}
            </div>
            <p className="text-indigo-200 text-sm mt-6">
              No credit card required • Unlimited drawings • Export anywhere
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-indigo-100">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brush className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
                SocialDraw
              </span>
            </div>
            <p className="text-indigo-700 leading-relaxed mb-6 max-w-md">
              Empowering artists and creative teams worldwide with the most intuitive collaborative drawing platform.
              Create, share, and inspire together.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-colors"
              >
                <Heart className="h-5 w-5 text-indigo-600" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-colors"
              >
                <Share2 className="h-5 w-5 text-indigo-600" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-colors"
              >
                <Globe className="h-5 w-5 text-indigo-600" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-indigo-900 mb-6">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Templates
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-indigo-900 mb-6">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-indigo-900 mb-6">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-indigo-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-indigo-600 text-sm">&copy; {new Date().getFullYear()} SocialDraw. All rights reserved.</p>
          <p className="text-indigo-500 text-sm mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 inline text-red-500" /> for the creative community
          </p>
        </div>
      </footer>
    </div>
  )
}
