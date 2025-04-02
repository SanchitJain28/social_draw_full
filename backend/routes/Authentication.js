import expess from "express";
import { User } from "../Schemmas/UserSchemma.js";
import { upload } from "../middleware/multer.js";
import { uploadImage } from "../utils/clodinary.js";
import { verifyUser } from "../middleware/verifyUser.js";
export const router = expess.Router();

router.get("/api/test", async (req, res) => {
  res.send("Hello from test route");
});

router.post("/api/create-user", upload.single("file"), async (req, res) => {
  try {
    console.log(req.file);
    const { name, email, password, PhoneNo } = req.body;
    //CHECK IF USER ALREADY EXISTS
    let profilePic = "";
    if (req.file) {
      const imageUrl = await uploadImage(req.file.path);
      console.log(imageUrl);
      profilePic = imageUrl;
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: false,
        message: "User Already Exists",
      });
    }
    const newUser = new User({
      name,
      email,
      password,
      PhoneNo,
      profilePic: profilePic,
    });
    const savedUser = await newUser.save();
    return res.status(201).json({
      status: true,
      message: "User Created Successfully",
      data: savedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // ??CHECK IF USER EXISTS
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User Not Found,Please regester on this app",
      });
    }
    //CHECK THE PASSWORD
    const isPasswordCorrect =await user.isPasswordCorrect(password);
    //PASSWORD IS INCORRECT
    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: false,
        message: "Incorrect Password",
      });
    }
    const refreshToken =await user.generateRefreshToken();
    const accessToken =await user.generateAccessToken();
    const refreshTokenOption= {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    }
    const option= {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
    }
    user.refreshToken = refreshToken
    return res.
    status(200).
    cookie("refreshToken", refreshToken, refreshTokenOption).
    cookie("accessToken", accessToken, option).
    json({
      status: true,
      message: "Login Successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});


router.get("/api/get-user",verifyUser,async(req,res)=>{
  try {
    const user = await User.findById(req.user._id).select("-password")
    return res.status(200).json({
      status: true,
      message: "User Fetched Successfully",
      data: user,
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
})