import  { useState } from 'react'
import { h2, primaryButton } from '../Themeclasses'
import axios from 'axios'
const Axios = axios.create({
    baseURL: 'http://localhost:3000'
  });

export default function FileUpload() {
    const [file, setFiles] = useState<File|null>(null)
    const fileUpload = async () => {
        if (!file) {
            console.log("No file selected");
            return;
        }
    
        const formData = new FormData();
        formData.append("file", file); // "file" should match the field name in Multer
    
        try {
            const response = await Axios.post("/api/FileUpload", formData);
            console.log(response.data);
        } catch (error) {
            console.error("File upload error:", error);
        }
    };
    return (
        <div>
            <p className={h2}>Upload some fucking files</p>
            <button className={primaryButton + "my-4"} >Go to file upload</button>
            <form action="/profile" onSubmit={(e)=>{
                e.preventDefault();
            }} >
                <label htmlFor="file-upload" className="sr-only">Upload File</label>
                <input 
                    id="file-upload" 
                    type="file" 
                    title="Choose a file to upload" 
                    placeholder="No file chosen" 
                    onChange={(e)=>{
                        if (e.target.files && e.target.files[0]) {
                            setFiles(e.target.files[0]);
                        }
                    }} 
                    name="avatar" 
                    className='text-white bg-black p-4 mx-4 rounded-lg my-4' 
                />
            </form>
            <button className={primaryButton + "my-4"} onClick={()=>{
                fileUpload()
            }} >Submit</button>
        </div >
    )
}
