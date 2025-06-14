import express from "express";
import { drawing } from "../Schemmas/DrawingSchemma.js";
import { verifyUser } from "../middleware/verifyUser.js";

export const router = express.Router();

router.get("/api/test-draw", async (req, res) => {
  return res.send("Hello from test-draw route");
});

router.get("/api/get-drawings", verifyUser, async (req, res) => {
  try {
    const { _id } = req.user;
    //CHECK IF USER EXISTS
    if (!_id) {
      return res.status(400).json({
        status: false,
        message: "User Not Found,Please register on this app",
      });
    }
    console.log(_id);
    const drawings = await drawing.find({ userId: _id });
    return res.status(200).json({
      status: true,
      message: "Drawing fetched successfully",
      data: drawings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/api/single-drawing", async (req, res) => {
  try {
    const { id } = req.query;
    const singleDrawing = await drawing.findById(id);
    return res.status(200).json({
      status: true,
      message: "Drawing fetched successfully",
      data: singleDrawing,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/api/update-drawing", verifyUser, async (req, res) => {
  if (!req.user) {
    return res.status(400).json({
      status: false,
      message: "User Not Found,Please register on this app",
    });
  }  try {
    const { id } = req.query;
    const { drawings } = req.body;
    const singleDrawing = await drawing.findOne({ _id: id });
    if(singleDrawing.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: false,
          message: "You are not authorized to update this drawing",
        });
    }
    if (!singleDrawing) {
      return res.status(400).json({
        status: false,
        message: "Drawing Not Found",
      });
    }
    singleDrawing.elements = drawings;
    await singleDrawing.save();
    return res.status(200).json({
      status: true,
      message: "Drawing updated successfully",
      data: singleDrawing,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/api/update-drawing-shared", async (req, res) => {
  try {
    const { id } = req.query;
    const { drawings } = req.body;
    const singleDrawing = await drawing.findOne({ _id: id });
    if (!singleDrawing) {
      return res.status(400).json({
        status: false,
        message: "Drawing Not Found",
      });
    }
    singleDrawing.elements = drawings;
    await singleDrawing.save();
    return res.status(200).json({
      status: true,
      message: "Drawing updated successfully",
      data: singleDrawing,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/api/delete-drawing", verifyUser, async (req, res) => {
  try {
    const { id } = req.query;
    await drawing.findByIdAndDelete(id);
    return res.status(200).json({
      message: "Drawing deleted successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
});

router.post("/api/create-drawing", verifyUser, async (req, res) => {
  try {
    const { _id } = req.user;
    const newDrawing = new drawing({
      title: req.body.title,
      userId: _id,
    });
    await newDrawing.save();
    return res.status(200).json({
      status: true,
      message: "Drawing created successfully",
      data: newDrawing,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});
