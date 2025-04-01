import axios from "axios";
import { h2, normalInput, primaryButton, Primarypara, Secondarypara } from "../Themeclasses";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchemma } from "../Schemmas/SignUpSchemma";
import { toast } from "sonner"
interface FormDataProps {
    files?: FileList;
    name: string;
    email: string;
    password: string;
    PhoneNo: string;
}

export default function SignUp() {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false)
    const Axios = axios.create({
        baseURL: 'http://localhost:3000'
    });


    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(SignUpSchemma)
    });
    const file = watch("files");

    useEffect(() => {
        if (file && file[0]) {
            setPreview(URL.createObjectURL(file[0]));
        }
    }, [file]);


    const onSubmit = async (data:FormDataProps) => {
        setLoading(true)
        try {
            const { files, name, email, password, PhoneNo } = data
            const formData = new FormData();
            if (files) {
                formData.append("file", files[0]); // "file" should match the field name in Multer
            }
            formData.append("name", name); // "file" should match the field name in Multer
            formData.append("email", email); // "file" should match the field name in Multer
            formData.append("password", password); // "file" should match the field name in Multer
            formData.append("PhoneNo", PhoneNo); // "file" should match the field name in Multer
            const response = await Axios.post("/api/create-user", formData)
            toast.success("Event has been created.",{
                description:"Succesfully reggistered",
                className:""
            })

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
            <p className={h2 + "mx-4 my-4 "}>Welcome to the SignUp page</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col justify-center mx-4">
                    <div className="lg:my-4 flex flex-col">
                        <p className={errors.name?.message ? Secondarypara : Primarypara}>{errors.name?.message ? errors.name?.message : "Username"}</p>
                        <input
                            defaultValue=""
                            {...register("name")}
                            className={normalInput + "lg:w-1/2"} />
                    </div>

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


                    <div className="lg:my-4 flex flex-col">
                        <p className={errors.PhoneNo?.message ? Secondarypara : Primarypara}>{errors.PhoneNo?.message ? errors.PhoneNo?.message : "Phone number"}</p>
                        <input
                            defaultValue=""
                            {...register("PhoneNo")}
                            className={normalInput + "lg:w-1/2"} />
                    </div>


                    <input
                        type="file"
                        id="profile_pic"
                        className="hidden"
                        {...register("files")}
                    // onChange={handleFileChange}
                    />
                    <div className="flex flex-col lg:flex-row justify-between">
                        <label htmlFor="profile_pic" className={Primarypara + "bg-black p-4 my-4 rounded-xl"} >Choose a profile picture</label>
                        {preview && (
                            <img
                                src={preview}
                                alt="Profile Preview"
                                className="w-20 h-20 object-cover rounded-full border border-gray-300 m-4"
                            />
                        )}
                    </div>
                    <input type="submit" disabled={loading} value={loading ? "submitting" : "submit"} className={primaryButton + "w-80"} />

                </div>

            </form>
        </div>
    )
}
