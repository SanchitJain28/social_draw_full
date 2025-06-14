import { useRef, useState, RefObject } from "react";
import { getCookie, setCookie } from "./AddCookie";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { generateUserColor } from "./generateUserColor";
import { generateAnonymousUsername } from "./generateRandomNames";
import {
  ExcalidrawElement,
  OrderedExcalidrawElement,
} from "@excalidraw/excalidraw/element/types";

interface CollaborativeUser {
  _id: string;
  id: string;
  name?: string;
  color: string;
  cursor?: { x: number; y: number };
  isVerified: boolean;
  isAdmin: boolean;
}

interface SocketClientProps {
  drawingId: string;
  user: CollaborativeUser;
  onConnected: (event: boolean) => void;
  onChangeSceneElements: (
    elements: readonly OrderedExcalidrawElement[]
  ) => void;
  updateSceneWithRetry: (elements: readonly ExcalidrawElement[]) => void;
  onReceivingUpdate: (event: boolean) => void;
  // Add ref props
  excalidrawAPIRef: RefObject<any>;
  isProcessingRemoteUpdateRef: RefObject<boolean>;
  onConnectedUsers: (users: CollaborativeUser[]) => void;
}

export default function SocketClient({
  drawingId,
  user,
  onConnected,
  onChangeSceneElements,
  updateSceneWithRetry,
  onReceivingUpdate,
  excalidrawAPIRef,
  isProcessingRemoteUpdateRef,
  onConnectedUsers,
}: SocketClientProps) {
  const socketRef = useRef<Socket | null>(null);

  const isSocketInitialized = useRef<boolean>(false);

  const [, setIsReceivingUpdate] = useState<boolean>(false);

  const [, setIsConnected] = useState<boolean>(false);
  const [, setConnectedUsers] = useState<CollaborativeUser[]>([]);

  const [, setSceneElements] = useState<
    readonly OrderedExcalidrawElement[] | null | undefined
  >();

  if (!drawingId || isSocketInitialized.current) return;

  const isCollabrating = getCookie("collaborating");
  if (!isCollabrating) {
    console.warn("Not collaborating, skipping socket initialization");
    return;
  }

  console.log("Initializing socket connection for room:", drawingId);
  isSocketInitialized.current = true;

  socketRef.current = io("http://localhost:3000", {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  const socket = socketRef.current;

  socket.on("connect", () => {
    onConnected(true);
    setIsConnected(true);
    socket.emit("join-room", {
      roomId: drawingId,
      userId: user?._id || null,
      isAdmin: true,
      socketId: socket.id,
      isLogin: user ? true : false,
    });
    toast.success("Connected to collaboration server", {
      position: "bottom-right",
      autoClose: 2000,
    });
    setCookie("roomInitialized", drawingId, 7);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
    setIsConnected(false);
    toast.warn("Disconnected from collaboration server", {
      position: "bottom-right",
      autoClose: 2000,
    });
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
    setIsConnected(false);
    toast.error("Failed to connect to collaboration server", {
      position: "top-right",
      autoClose: 3000,
    });
  });

  socket.on("user-joined", (data) => {
    const { socketId, islogin, isAdmin } = data;
    console.log("User joined:", socketId);
    setConnectedUsers((prev) => {
      const userExists = prev.some((user) => user.id === socketId);
      if (userExists) {
        console.log("User already exists in list, skipping add");
        return prev;
      }

      if (islogin) {
        toast.info("A verified joined the drawing", {
          position: "bottom-right",
          autoClose: 1500,
        });
      } else {
        toast.info("A Non - verified joined the drawing", {
          position: "bottom-right",
          autoClose: 1500,
        });
      }

      onConnectedUsers([
        ...prev,
        {
          _id: socketId, // Use socketId as a fallback for _id if not available
          id: socketId,
          color: generateUserColor(socketId),
          name: `User ${generateAnonymousUsername()}`,
          isVerified: islogin,
          isAdmin,
        },
      ]);

      return [
        ...prev,
        {
          _id: socketId, // Use socketId as a fallback for _id if not available
          id: socketId,
          color: generateUserColor(socketId),
          name: `User ${generateAnonymousUsername()}`,
          isVerified: islogin,
          isAdmin,
        },
      ];
    });
  });

  socket.on("user-left", (userId: string) => {
    console.log("User left:", userId);
    toast.info("A user left the drawing", {
      position: "bottom-right",
      autoClose: 1500,
    });
    setConnectedUsers((prev) => prev.filter((user) => user.id !== userId));
  });

  socket.on(
    "drawing-update",
    (data: { elements: readonly ExcalidrawElement[]; userId: string }) => {
      if (data.userId === socket.id) {
        console.log("Ignoring own update");
        return;
      }
      onReceivingUpdate(true);
      setIsReceivingUpdate(true);
      updateSceneWithRetry(data.elements);

      setTimeout(() => {
        onReceivingUpdate(false);
        setIsReceivingUpdate(false);
      }, 100);
    }
  );

  socket.on("canvas-cleared", (data: { userId: string }) => {
    if (data.userId !== socket.id) {
      console.log("Canvas cleared by:", data.userId);
      if (excalidrawAPIRef.current) {
        isProcessingRemoteUpdateRef.current = true;
        excalidrawAPIRef.current.updateScene({ elements: [] });
        setTimeout(() => {
          isProcessingRemoteUpdateRef.current = false;
        }, 50);
      }
      onChangeSceneElements([]);
      setSceneElements([]);
      toast.info("Canvas was cleared by another user", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  });

  return () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room", drawingId);
      socketRef.current.disconnect();
      isSocketInitialized.current = false;
    }
  };
}
