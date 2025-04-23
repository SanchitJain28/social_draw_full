import { h2, SecondaryButton } from '../Themeclasses'
import { NavLink } from "react-router";
import { useEffect, useState } from 'react';
import Info from './Info';
import { Axios } from '../ApiFormat';

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
      // console.log(error)
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
    }
    finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getUser()
  }, [])
  if (loading) {
    return <div className="m-4">
      <p className={h2 + "text-center"}>Loading...</p>
    </div>
  }
  return (
    <div className="flex flex-col justify-center p-8">
      <div className="flex flex-row justify-between">
        <p className={h2 + " my-4"}>{user ? "hi " + user?.name : "Please log in"} </p>
        {user?.profilePic?<img src={user?.profilePic} className='w-24 rounded-lg' />:""}
      </div>

      <p className={h2 + " my-4"}>Welcome to Social Draw, draw with your friends</p>
      {/* <p className={h3 + " my-4"}>Welcome {user ? user.name : "Please log in "}</p> */}
      <Info />

      <div className="flex py-4">
        {user ?
          <div className='my-4'>
            <NavLink to="/dashboard" className={SecondaryButton + "mr-4"} >Go to dashboard</NavLink>
          </div> :
          <div className='my-4'>
            <NavLink to="/login" className={SecondaryButton + "mr-4"} >Go to login</NavLink>
            <NavLink to="/signup" className={SecondaryButton + "mx-4"} >Go to signup</NavLink>
          </div>
        }
      </div>
    </div>
  )
}

