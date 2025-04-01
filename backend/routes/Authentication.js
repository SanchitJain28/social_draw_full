import expess from "express";
import { User } from "../Schemmas/UserSchemma.js";
import { upload } from "../middleware/multer.js";
import { uploadImage } from "../utils/clodinary.js";
export const router = expess.Router();

router.get("/api/test", async (req, res) => {
  res.send("Hello from test route");
});

router.post("/api/create-user",upload.single("file"), async (req, res) => {
  try {
    console.log(req.file)
    const { name, email, password, PhoneNo } = req.body;
    //CHECK IF USER ALREADY EXISTS
    let profilePic=""
    if(req.file){
      const imageUrl = await uploadImage(req.file.path)
      console.log(imageUrl)
      profilePic=imageUrl
    }
    const user=await User.findOne({email})
    if(user){
        return res.status(400).json({
            status:false,
            message:"User Already Exists",
        })
    }
    const newUser = new User({
      name,
      email,
      password,
      PhoneNo,
      profilePic:profilePic,
    });
    const savedUser =await newUser.save();
    return res.status(201).json({
      status: true,
      message: "User Created Successfully",
      data:savedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});
