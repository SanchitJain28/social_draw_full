"use client"

import { Users, Zap, Palette, Globe, Sparkles, Heart, ArrowRight, CheckCircle, Brush, Share2 } from "lucide-react"

export default function Info() {
  const features = [
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Draw together with friends or teammates instantly, seeing every stroke as it happens.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast & Intuitive",
      description: "Enjoy a smooth, lag-free drawing experience with our beautifully simple interface.",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Palette,
      title: "Professional Tools",
      description: "Access a complete suite of brushes, colors, shapes, and customizable backgrounds.",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Globe,
      title: "Works Everywhere",
      description: "No installations needed—just open your browser and start creating from any device.",
      color: "from-green-500 to-emerald-600",
    },
  ]

  const benefits = [
    "Perfect for artists and designers",
    "Ideal for student collaboration",
    "Great for team brainstorming",
    "Excellent for remote workshops",
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Main Description */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-full mb-6">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="text-indigo-800 font-semibold">Why Choose SocialDraw?</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6 leading-tight">
          Unleash Your Creativity with the Ultimate
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {" "}
            Collaborative Drawing Experience
          </span>
        </h2>

        <p className="text-xl text-indigo-700 max-w-4xl mx-auto leading-relaxed">
          Whether you're brainstorming ideas, sketching with friends, or working on a digital masterpiece, SocialDraw
          lets you create, share, and collaborate live—no matter where you are in the world.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl p-8 shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-indigo-900 mb-3 group-hover:text-indigo-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-indigo-700 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-indigo-100">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-indigo-900 mb-6">Perfect for Every Creative Mind</h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-indigo-800 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-indigo-700">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-medium">Loved by 50,000+ creators</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-indigo-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brush className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-indigo-900">Live Collaboration</span>
                <div className="ml-auto w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">A</span>
                  </div>
                  <span className="text-sm text-indigo-700">Alex is drawing...</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600">S</span>
                  </div>
                  <span className="text-sm text-indigo-700">Sarah added a shape</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">M</span>
                  </div>
                  <span className="text-sm text-indigo-700">Mike changed color</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Make Creativity More Interactive?</h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Join thousands of artists, designers, and creative teams who are already using SocialDraw to bring their
            ideas to life together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors shadow-lg">
              Start Creating Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="inline-flex items-center px-6 py-3 bg-white/20 text-white border border-white/30 font-semibold rounded-lg hover:bg-white/30 transition-colors">
              <Share2 className="mr-2 h-5 w-5" />
              Share with Friends
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
