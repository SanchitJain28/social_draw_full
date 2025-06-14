"use client";

import { useEffect, useState, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type {
  ExcalidrawInitialDataState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { useDebounce } from "@uidotdev/usehooks";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router";
import { Axios } from "../ApiFormat";
import type {
  ExcalidrawElement,
  OrderedExcalidrawElement,
} from "@excalidraw/excalidraw/element/types";

import { io, Socket } from "socket.io-client";
import CustomHeader from "./CustomHeader";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CollaborativeUser } from "@/types/Types";
import { generateUserColor } from "@/utils/generateUserColor";
import { SessionEndedModal } from "./Modals/SessionEnded";

export default function SharedDraw() {
  const socketRef = useRef<Socket | null>(null);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const isSocketInitialized = useRef<boolean>(false);
  const pendingUpdatesRef = useRef<ExcalidrawElement[][]>([]);

  // Add flag to track if we're processing a remote update
  const isProcessingRemoteUpdate = useRef<boolean>(false);
  const lastLocalUpdateId = useRef<string | null>(null);

  // FIX: Add flag to track initial load completion
  const isInitialLoadComplete = useRef<boolean>(false);
  const initialElementsRef = useRef<readonly ExcalidrawElement[] | null>(null);

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const navigate = useNavigate();
  const [saving, setSaving] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const [initialDrawings, setInitialDrawings] =
    useState<ExcalidrawInitialDataState | null>(null);
  const [sceneElements, setSceneElements] = useState<
    readonly OrderedExcalidrawElement[] | null | undefined
  >();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Socket.io states
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectedUsers, setConnectedUsers] = useState<CollaborativeUser[]>([]);
  const [isReceivingUpdate, setIsReceivingUpdate] = useState<boolean>(false);
  const [isThereAdmin, setIsThereAdmin] = useState<boolean>(true);

  const debouncedSceneElements = useDebounce(sceneElements, 600);

  //auth handling
  const { user, authLoading } = useAuth();

  // FIX: Stable reference for drawing ID
  const drawingId = searchParams.get("id");

  // Generate consistent color for user - FIXED: Remove from dependencies

  // FIX: Helper function to compare element arrays - Remove from dependencies
  const elementsAreEqual = (
    elements1: readonly ExcalidrawElement[] | null | undefined,
    elements2: readonly ExcalidrawElement[] | null | undefined
  ): boolean => {
    if (elements1 === elements2) return true;
    if (!elements1 || !elements2) return elements1 === elements2;
    if (elements1.length !== elements2.length) return false;

    return elements1.every((el1, index) => {
      const el2 = elements2[index];
      return (
        el1.id === el2.id &&
        el1.versionNonce === el2.versionNonce &&
        el1.updated === el2.updated
      );
    });
  };

  // Update scene with retry mechanism - FIXED: Remove from dependencies
  const updateSceneWithRetry = (elements: readonly ExcalidrawElement[]) => {
    const attemptUpdate = (retries = 3) => {
      if (excalidrawAPIRef.current) {
        // Set flag before updating to prevent onChange from firing
        isProcessingRemoteUpdate.current = true;
        excalidrawAPIRef.current.updateScene({ elements });
        // Reset flag after a short delay
        setTimeout(() => {
          isProcessingRemoteUpdate.current = false;
        }, 50);
        return;
      }

      if (retries > 0) {
        console.log(`API not ready, retrying... (${retries} attempts left)`);
        setTimeout(() => attemptUpdate(retries - 1), 100);
      } else {
        console.warn("Failed to update scene: API not ready after retries");
        pendingUpdatesRef.current.push(elements as ExcalidrawElement[]);
      }
    };

    attemptUpdate();
  };

  // Process queued updates when API becomes available
  useEffect(() => {
    if (excalidrawAPI && pendingUpdatesRef.current.length > 0) {
      console.log(
        "Processing queued updates:",
        pendingUpdatesRef.current.length
      );
      const lastUpdate = pendingUpdatesRef.current.pop();
      if (lastUpdate) {
        isProcessingRemoteUpdate.current = true;
        excalidrawAPI.updateScene({ elements: lastUpdate });
        setSceneElements(lastUpdate as readonly OrderedExcalidrawElement[]);
        setTimeout(() => {
          isProcessingRemoteUpdate.current = false;
        }, 50);
      }
      pendingUpdatesRef.current = [];
    }
  }, [excalidrawAPI]); // Only depend on excalidrawAPI

  // FIX: Broadcast function - Remove from dependencies
  const broadcastDrawingUpdate = (elements: readonly ExcalidrawElement[]) => {
    const updateId = Date.now().toString();
    lastLocalUpdateId.current = updateId;
    socketRef.current?.emit("drawing-update", {
      roomId: drawingId,
      elements,
      updateId,
    });
  };

  // Clear canvas for all users
  const clearCanvasForAll = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("clear-canvas", { roomId: drawingId });
    }
    if (excalidrawAPIRef.current) {
      isProcessingRemoteUpdate.current = true;
      excalidrawAPIRef.current.updateScene({ elements: [] });
      setSceneElements([]);
      setTimeout(() => {
        isProcessingRemoteUpdate.current = false;
      }, 50);
    }
  };

  const getDrawing = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { data },
      } = await Axios.get(`/api/single-drawing?id=${drawingId}`);

      // FIX: Store initial elements for comparison
      const elements = data.elements as readonly OrderedExcalidrawElement[];
      initialElementsRef.current = elements;

      setInitialDrawings(data.elements);
      setSceneElements(elements);

      // FIX: Mark initial load as complete after a short delay
      setTimeout(() => {
        isInitialLoadComplete.current = true;
        // console.log("Initial load completed");
      }, 1000);
    } catch (error) {
      console.log(error);
      setError("Failed to load drawing. Please try again.");
      toast.error("Failed to load drawing", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  useEffect(() => {
    if (!loading && !authLoading) {
      const isThereAdmin = connectedUsers.some((user) => user.isAdmin);
      setIsThereAdmin(isThereAdmin);
    }
  }, [connectedUsers, loading, authLoading]);

  // Get or create session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("drawing_session_id");
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem("drawing_session_id", sessionId);
    }
    return sessionId;
  };

  // FIX: Handle onChange with proper checks - Remove from dependencies
  const handleOnchange = (elements: readonly ExcalidrawElement[] | null) => {
    // Ignore changes during remote updates or initial load
    if (
      isReceivingUpdate ||
      isProcessingRemoteUpdate.current ||
      !isInitialLoadComplete.current
    ) {
      return;
    }

    // FIX: Compare with current scene elements to prevent unnecessary updates
    if (elementsAreEqual(elements, sceneElements)) {
      return;
    }

    setSceneElements(elements as readonly OrderedExcalidrawElement[] | null);
  };

  // FIX: Socket initialization - Only run once
  useEffect(() => {
    if (!drawingId || isSocketInitialized.current) return;

    if (authLoading) {
      return;
    }

    // console.log("Initializing socket connection for room:", drawingId);
    isSocketInitialized.current = true;

    const sessionId = getSessionId();
    const isReturningUser =
      sessionStorage.getItem(`room_${drawingId}_visited`) === "true";

    socketRef.current = io("https://social-draw-full.onrender.com/", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", {
        roomId: drawingId,
        userId: user?._id || null, // Use user ID or socket ID if not authenticated
        isAdmin: false,
        socketId: socket.id,
        islogin: user ? true : false,
        sessionId,
        isReturningUser,
      });

      sessionStorage.setItem(`room_${drawingId}_visited`, "true");

      toast.success("Connected to collaboration server", {
        position: "bottom-right",
        autoClose: 2000,
      });
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

    socket.on("room-users", (users) => {
      // console.log(users);
      const connectUsersToDrawing = users.map(
        (user: {
          sessionId: string;
          isAdmin: boolean;
          sessionName: string;
        }) => {
          return {
            id: user.sessionId,
            color: generateUserColor(user.sessionId),
            name: `User ${user.sessionName}`,
            isVerified: false,
            isAdmin: user.isAdmin,
            socketId: "",
          };
        }
      );
      // console.log(connectUsersToDrawing);
      setConnectedUsers(connectUsersToDrawing);
    });

    socket.on("user-joined", (data) => {
      const { islogin, isAdmin, isNewUser, sessionId, sessionName } = data;
      // console.log(data);
      // console.log("User joined:", socketId);

      if (isNewUser) {
        setConnectedUsers((prev) => {
          const userExists = prev.some((user) => user.id === sessionId);
          if (userExists) return prev;

          toast.info("A new user joined the drawing", {
            position: "bottom-right",
            autoClose: 1500,
          });

          return [
            ...prev,
            {
              id: sessionId,
              color: generateUserColor(data.sessionId),
              name: `User ${sessionName}`,
              isVerified: islogin,
              isAdmin,
              socketId: "",
            },
          ];
        });
      } else {
        setConnectedUsers((prev) => {
          const userExists = prev.some((user) => user.id === data.sessionId);
          if (!userExists) {
            return [
              ...prev,
              {
                id: sessionId,
                color: generateUserColor(data.sessionId),
                name: `User ${sessionName}`,
                isVerified: islogin,
                isAdmin,
                socketId: "",
              },
            ];
          }
          return prev;
        });
      }
    });

    socket.on("user-left", (data) => {
      const { sessionId } = data;
      console.log("User left:", sessionId);
      toast.info("A user left the drawing", {
        position: "bottom-right",
        autoClose: 1500,
      });
      setConnectedUsers((prev) => prev.filter((user) => user.id !== sessionId));
    });

    // Improve drawing update handler
    socket.on(
      "drawing-update",
      (data: { elements: readonly ExcalidrawElement[]; userId: string }) => {
        if (data.userId === socket.id) {
          console.log("Ignoring own update");
          return;
        }
        setIsReceivingUpdate(true);
        updateSceneWithRetry(data.elements);

        setTimeout(() => setIsReceivingUpdate(false), 100);
      }
    );

    socket.on("canvas-cleared", (data: { userId: string }) => {
      if (data.userId !== socket.id) {
        console.log("Canvas cleared by:", data.userId);
        if (excalidrawAPIRef.current) {
          isProcessingRemoteUpdate.current = true;
          excalidrawAPIRef.current.updateScene({ elements: [] });
          setTimeout(() => {
            isProcessingRemoteUpdate.current = false;
          }, 50);
        }
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
  }, [authLoading]); // Only depend on drawingId

  // FIX: Load drawing only once
  useEffect(() => {
    if (!authLoading) {
      getDrawing();
    }
  }, [authLoading]); // Only depend on drawingId

  // FIX: Completely rewrite the save useEffect to prevent loops
  useEffect(() => {
    const updateDrawing = async () => {
      if (
        debouncedSceneElements &&
        initialDrawings &&
        !isReceivingUpdate &&
        !isProcessingRemoteUpdate.current &&
        isInitialLoadComplete.current &&
        !elementsAreEqual(debouncedSceneElements, initialElementsRef.current)
      ) {
        setSaving(true);
        try {
          broadcastDrawingUpdate(debouncedSceneElements);

          await Axios.post(`/api/update-drawing-shared?id=${drawingId}`, {
            drawings: debouncedSceneElements,
          });
          setLastSaved(new Date());
          toast.success("Drawing saved", {
            position: "bottom-right",
            autoClose: 1000,
            hideProgressBar: true,
          });
        } catch (error) {
          console.log("Save error:", error);
          toast.error("Failed to save drawing", {
            position: "top-right",
            autoClose: 3000,
          });
        } finally {
          setSaving(false);
        }
      }
    };

    // Add a small delay to ensure we don't save during rapid updates
    const saveTimer = setTimeout(updateDrawing, 100);
    return () => clearTimeout(saveTimer);
  }, [debouncedSceneElements]); // Only essential dependencies

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
          <p className="text-lg font-medium text-slate-300">
            Loading your drawing...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-400 mb-6">{error}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={getDrawing}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <SessionEndedModal isOpen={!isThereAdmin} />

      <CustomHeader
        isDeletable={false}
        saving={saving}
        lastSaved={lastSaved}
        isConnected={isConnected}
        connectedUsers={connectedUsers}
        navigate={() => {
          navigate("/dashboard");
        }}
        clearCanvasForAll={clearCanvasForAll}
        shareLink="localhost:3000/draw?id="
        onCollaborateStart={() => {
          // You can implement collaboration start logic here if needed
          console.log("Collaboration started");
        }}
      />
      {/* Canvas */}
      <div className="flex-1 relative">
        {initialDrawings && (
          <Excalidraw
            theme="dark"
            initialData={{
              elements: [
                ...(Array.isArray(initialDrawings) ? initialDrawings : []),
              ],
            }}
            excalidrawAPI={(api) => {
              console.log(
                "Excalidraw API initialized at:",
                new Date().toISOString()
              );
              setExcalidrawAPI(api);
              excalidrawAPIRef.current = api;
            }}
            onChange={handleOnchange}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
          border: "1px solid #334155",
        }}
      />
    </div>
  );
}
