"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchemma } from "../Schemmas/SignUpSchemma";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Phone,
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Axios } from "@/ApiFormat";
import { useNavigate } from "react-router";
interface FormDataProps {
  files?: FileList;
  name: string;
  email: string;
  password: string;
  PhoneNo: string;
}

export default function SignUp() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate =useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignUpSchemma),
  });

  const file = watch("files");

  useEffect(() => {
    if (file && file[0]) {
      setPreview(URL.createObjectURL(file[0]));
    }
  }, [file]);

  const onSubmit = async (data: FormDataProps) => {
    setLoading(true);
    try {
      const { files, name, email, password, PhoneNo } = data;
      const formData = new FormData();
      if (files) {
        formData.append("file", files[0]);
      }
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("PhoneNo", PhoneNo);

      const response = await Axios.post("/api/create-user", formData);
      toast.success("Account created successfully!", {
        description: "Welcome to SocialDraw! You can now start creating.",
      });

      console.log(response);
      console.log(data);
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create account", {
        description: "Please check your information and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Join SocialDraw
          </h1>
          <p className="text-lg text-indigo-700">
            Create your account and start drawing with friends
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Profile Preview"
                    className="w-24 h-24 object-cover rounded-full border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-indigo-100">
                    <Camera className="h-8 w-8 text-indigo-400" />
                  </div>
                )}
                <input
                  type="file"
                  id="profile_pic"
                  className="hidden"
                  accept="image/*"
                  {...register("files")}
                />
                <label
                  htmlFor="profile_pic"
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  <Upload className="h-4 w-4 text-white" />
                </label>
              </div>
              <label
                htmlFor="profile_pic"
                className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium"
              >
                Choose profile picture
              </label>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Full Name</span>
                </div>
              </label>
              <input
                {...register("name")}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                } focus:outline-none focus:ring-2 bg-white`}
              />
              {errors.name && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.name.message}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>Email Address</span>
                </div>
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email address"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                } focus:outline-none focus:ring-2 bg-white`}
              />
              {errors.email && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Password</span>
                </div>
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 bg-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>Phone Number</span>
                </div>
              </label>
              <input
                {...register("PhoneNo")}
                type="tel"
                placeholder="Enter your phone number"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.PhoneNo
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                } focus:outline-none focus:ring-2 bg-white`}
              />
              {errors.PhoneNo && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.PhoneNo.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {/* Additional Info */}
            <div className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Sign in here
              </a>
            </div>
          </form>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-indigo-900">Collaborate</p>
            <p className="text-xs text-indigo-700">Draw with friends</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Upload className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-900">Share</p>
            <p className="text-xs text-purple-700">Export & share</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-indigo-900">Auto-save</p>
            <p className="text-xs text-indigo-700">Never lose work</p>
          </div>
        </div>
      </div>
    </div>
  );
}
