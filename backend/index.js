import express from "express";
import { router as Authentication } from "./routes/Authentication.js";
import { router as Drawing } from "./routes/Drawing.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { RunDatabase } from "./database.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { generateSessionName } from "./utils/generateSessionName.js";

RunDatabase();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://socialdraw.netlify.app", // Match your frontend URL
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "https://socialdraw.netlify.app", // Adjust this to your frontend's URL
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // For form data

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(Authentication);
app.use(Drawing);

const port = 3000;

const rooms = new Map();
const activeConnections = new Map(); // socketId -> sessionId
const userSessions = new Map(); // sessionId -> { socketId, roomId, lastSeen }
const sessionNames = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining a room (useful for drawing sessions)
  socket.on("join-room", (data) => {
    //extracting the data from the client
    const { roomId, islogin, isAdmin, sessionId, isReturningUser } = data;

    //active connections
    activeConnections.set(socket.id, sessionId);
    // console.log(activeConnections);

    //joining the room
    socket.join(roomId);

    //set the room in backend ,first it adds the room in Total rooms variable , now this room is in ROOMS
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    //room sessions
    //HERE IT CHECKS THE SESSION IS ROOM SESSIONS ,IF THERE IS ROOM SESSION IN ROOM SESSIONS ,IT WILL BE EVALUATED TO TRUE
    const roomSessions = rooms.get(roomId);
    const wasInRoom = roomSessions.has(sessionId);

    // console.log(wasInRoom);

    userSessions.set(sessionId, {
      socketId: socket.id,
      roomId: roomId,
      lastSeen: Date.now(),
      isAdmin,
    });

    roomSessions.add(sessionId);

    if (!sessionNames.has(sessionId)) {
      sessionNames.set(sessionId, generateSessionName());
    }
    // console.log(sessionNames);
    // console.log(roomSessions);

    // console.log(`User ${socket.id} joined room: ${roomId}`);

    const isNewUser = !wasInRoom && !isReturningUser;

    //emitting the user who is joined recently
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      islogin,
      isAdmin,
      sessionId,
      isNewUser,
      sessionName: sessionNames.get(sessionId),
    });

    // console.log(Array.from(roomSessions))
    // console.log(userSessions);
    const currentUsers = Array.from(roomSessions)
      .filter((sid) => {
        return sid !== sessionId;
      })
      .map((sid) => {
        const userSession = userSessions.get(sid);

        return {
          sessionId: sid,
          isOnline: userSessions.has(sid),
          isAdmin: userSession.isAdmin,
          sessionName:sessionNames.get(sid)
        };
      });

    // console.log(currentUsers);
    console.log(roomSessions);

    socket.emit("room-users", currentUsers);
  });

  // Handle leaving a room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit("user-left", socket.id);
  });

  // Handle Excalidraw drawing updates
  socket.on("drawing-update", (data) => {
    // Broadcast the entire scene update to all users in the same room except sender
    socket.to(data.roomId).emit("drawing-update", {
      elements: data.elements,
      userId: socket.id,
    });
  });

  // Handle canvas clear for Excalidraw
  socket.on("clear-canvas", (data) => {
    socket.to(data.roomId).emit("canvas-cleared", {
      userId: socket.id,
      roomId: data.roomId,
    });
  });

  // Handle legacy drawing events (for backward compatibility)
  socket.on("drawing-start", (data) => {
    socket.to(data.roomId).emit("drawing-start", {
      ...data,
      userId: socket.id,
    });
  });

  socket.on("drawing-move", (data) => {
    socket.to(data.roomId).emit("drawing-move", {
      ...data,
      userId: socket.id,
    });
  });

  socket.on("drawing-end", (data) => {
    socket.to(data.roomId).emit("drawing-end", {
      ...data,
      userId: socket.id,
    });
  });

  // Handle shape drawing
  socket.on("draw-shape", (data) => {
    socket.to(data.roomId).emit("draw-shape", {
      ...data,
      userId: socket.id,
    });
  });

  // Handle text addition
  socket.on("add-text", (data) => {
    socket.to(data.roomId).emit("add-text", {
      ...data,
      userId: socket.id,
    });
  });

  // Handle cursor movement (for Excalidraw collaboration)
  socket.on("cursor-update", (data) => {
    socket.to(data.roomId).emit("cursor-update", {
      x: data.x,
      y: data.y,
      userId: socket.id,
    });
  });

  // Handle chat messages (if you have chat functionality)
  socket.on("chat-message", (data) => {
    socket.to(data.roomId).emit("chat-message", {
      message: data.message,
      userId: socket.id,
      username: data.username,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle authentication events
  socket.on("authenticate", (token) => {
    // You can verify the token here and associate it with the socket
    // This is useful for identifying users in drawing sessions
    console.log("User authenticated:", socket.id);
    socket.authenticated = true;
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const sessionId = activeConnections.get(socket.id);
    if (sessionId && userSessions.has(sessionId)) {
      const userSession = userSessions.get(sessionId);
      setTimeout(() => {
        const currentSession = userSessions.get(sessionId);
        if (currentSession && currentSession.socketId === socket.id) {
          // User hasn't reconnected, they've left
          handleUserLeaving(socket, userSession.roomId, sessionId, true);
        }
      }, 5000);
    }
    activeConnections.delete(socket.id);
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

function handleUserLeaving(socket, roomId, sessionId, hasLeftSession) {
  if (!roomId || !sessionId) return;

  const roomSessions = rooms.get(roomId);
  if (!roomSessions) return;

  if (hasLeftSession) {
    roomSessions.delete(sessionId);
    userSessions.delete(sessionId);

    socket.to(roomId).emit("user-left", {
      sessionId: sessionId,
      hasLeftSession: true,
    });

    if (roomSessions.size === 0) {
      rooms.delete(roomId);
    }
  } else {
    socket.to(roomId).emit("user-left", {
      sessionId: sessionId,
      hasLeftSession: false,
    });
  }

  socket.leave(roomId);
  console.log(
    `User ${sessionId} left room ${roomId}${
      hasLeftSession ? " (session ended)" : " (temporary)"
    }`
  );
}

app.get("/", (req, res) => {
  res.send("Hello World with Socket.io!");
});

// IMPORTANT: Use httpServer.listen instead of app.listen
httpServer.listen(port, () => {
  console.log(`Server with Socket.io listening on port ${port}`);
});
