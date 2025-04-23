import { h2, normalInput, primaryButton, Primarypara, Secondarypara } from "../Themeclasses";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner"
import { SignInSchemma } from "../Schemmas/SignInSchemma";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import { Axios } from "@/ApiFormat";

interface FormDataProps {
  email: string;
  password: string;
}
const setAccessToken = (token:string) => {
  Cookies.set("laudakaToken", token, { 
    expires: 7, // Cookie expiry in days
    secure: true, // Only send over HTTPS
    sameSite: "Strict", // Prevent CSRF attacks
    path: "/", // Available throughout the app
  });
};

// Call this function when you get the token (e.g., after login)
setAccessToken("your_jwt_token");
export default function Login() {
  const router=useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
 
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(SignInSchemma)
  });
  
  const onSubmit = async (data: FormDataProps) => {
    setLoading(true)
    try {
      const response = await Axios.post("/api/login", data)
      toast.success("Event has been created.", {
        description: "Login successfully",
        className: ""
      })
      router("/")
      console.log(response)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  };
  return (
    <div className="p-8">
      <p className={h2 + "mx-4 my-4 "}>Welcome to the Login page</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col justify-center mx-4">
          <div className="lg:my-4 flex flex-col">
            <p className={errors.email?.message ? Secondarypara : Primarypara}>{errors.email?.message ? errors.email?.message : "Email"}</p>
            <input
              defaultValue=""
              {...register("email")}
              className={normalInput + "lg:w-1/2"} />
          </div>

          <div className="lg:my-4 flex flex-col">
            <p className={errors.password?.message ? Secondarypara : Primarypara}>{errors.password?.message ? errors.password?.message : "Password"}</p>
            <input
              defaultValue=""
              {...register("password")}
              className={normalInput + "lg:w-1/2"} />
          </div>
          <input type="submit" disabled={loading} value={loading ? "submitting" : "submit"} className={primaryButton + "w-80"} />
        </div>
      </form>
    </div>
  )
}
