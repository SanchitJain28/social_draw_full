import React from 'react'
import { h4, normalInput, primaryButton } from '../Themeclasses'
import { Axios } from '../ApiFormat'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';


export default function DrawingCard() {

    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate=useNavigate()
    const createDrawing = async(data) => {
        try {
            const response =await Axios.post("/api/create-drawing", data)
            console.log(response)
            navigate(`/draw?id=${response.data.data._id}`)
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <form onSubmit={handleSubmit(createDrawing)}>
            <div className='border border-zinc-700 rounded-lg p-4 w-1/3'>
                <div className="p-4">
                    <p className={h4 + "my-4"}>Title</p>
                    <input className={normalInput + "w-full"} {...register("title")}></input>
                    <button className={primaryButton} type='submit'>Create</button>
                </div>
            </div>
        </form>
    )
}
