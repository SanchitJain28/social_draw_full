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
import DeleteDrawingModal from "./Modals/DeleteDrawingModal";
import { getCookie, setCookie } from "@/utils/AddCookie";
import { useAuth } from "@/hooks/useAuth";
import { generateUserColor } from "@/utils/generateUserColor";
import { CollaborativeUser } from "@/types/Types";

export default function Draw() {
  //ALL THE REFS OF THE THIS DRAW COMPONENT
  const socketRef = useRef<Socket | null>(null);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const isSocketInitialized = useRef<boolean>(false);
  const pendingUpdatesRef = useRef<ExcalidrawElement[][]>([]);

  //handling user authentication and loading state
  const { user, authLoading } = useAuth();

  // Track if we're processing a remote update
  const isProcessingRemoteUpdate = useRef<boolean>(false);

  // Track initial load completion
  const isInitialLoadComplete = useRef<boolean>(false);
  const [isCollabrating, setIsCollabrating] = useState<boolean>(false);

  //EXCVALIDRAW STATES
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Socket.io states
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborativeUser[]>([]);
  const [isReceivingUpdate, setIsReceivingUpdate] = useState<boolean>(false);

  const debouncedSceneElements = useDebounce(sceneElements, 600);

  const lastSavedElementsHash = useRef<string | null>(null);

  const drawingId = searchParams.get("id");

  const generateSessionId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("drawing_session_id");
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem("drawing_session_id", sessionId);
    }
    return sessionId;
  };

  const createElementsHash = (
    elements: readonly ExcalidrawElement[] | null | undefined
  ): string => {
    if (!elements || elements.length === 0) return "empty";
    return elements
      .map(
        (el) =>
          `${el.id}:${el.version}:${el.versionNonce}:${el.x}:${el.y}:${el.width}:${el.height}:${el.angle}`
      )
      .join("|");
  };

  const updateSceneWithRetry = (elements: readonly ExcalidrawElement[]) => {
    const attemptUpdate = (retries = 3) => {
      if (excalidrawAPIRef.current) {
        isProcessingRemoteUpdate.current = true;
        excalidrawAPIRef.current.updateScene({ elements });
        setTimeout(() => {
          isProcessingRemoteUpdate.current = false;
        }, 100);
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

  useEffect(() => {
    if (excalidrawAPI && pendingUpdatesRef.current.length > 0) {

      const lastUpdate = pendingUpdatesRef.current.pop();
      if (lastUpdate) {
        isProcessingRemoteUpdate.current = true;
        excalidrawAPI.updateScene({ elements: lastUpdate });
        setSceneElements(lastUpdate as readonly OrderedExcalidrawElement[]);
        setTimeout(() => {
          isProcessingRemoteUpdate.current = false;
        }, 100);
      }
      pendingUpdatesRef.current = [];
    }
  }, [excalidrawAPI]);

  // Broadcast function
  const broadcastDrawingUpdate = (elements: readonly ExcalidrawElement[]) => {
    if (!isCollabrating || !socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit("drawing-update", {
      roomId: drawingId,
      elements,
      updateId: Date.now().toString(),
    });
  };

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
      }, 100);
    }
  };

  const deleteDrawing = async () => {
    try {
      await Axios.delete(`/api/delete-drawing?id=${drawingId}`);
      navigate("/dashboard");
      toast.success("Drawing deleted successfully", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete drawing", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setShowDeleteConfirm(false);
  };

  const getDrawing = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { data },
      } = await Axios.get(`/api/single-drawing?id=${drawingId}`);
      if (data.userId !== user?._id) {
        setError("You do not have permission to view this drawing.");
        return;
      }

      const elements = data.elements as readonly OrderedExcalidrawElement[];

      setInitialDrawings(data.elements);
      setSceneElements(elements);

      // Store initial hash
      lastSavedElementsHash.current = createElementsHash(elements);

      // Mark initial load as complete after a delay
      setTimeout(() => {
        isInitialLoadComplete.current = true;
        console.log("Initial load completed");
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

  const handleOnchange = (elements: readonly ExcalidrawElement[] | null) => {
    if (
      isReceivingUpdate ||
      isProcessingRemoteUpdate.current ||
      !isInitialLoadComplete.current
    ) {
      console.log("Ignoring onChange - remote update or initial load");
      return;
    }

    setSceneElements(elements as readonly OrderedExcalidrawElement[]);
  };

  useEffect(() => {
    if (!drawingId || isSocketInitialized.current) return;

    const isCollabrating = getCookie("collaborating");
    if (!isCollabrating) {
      console.warn("Not collaborating, skipping socket initialization");
      return;
    }
    console.log("Initializing socket connection for room:", drawingId);
    isSocketInitialized.current = true;

    const sessionId = getSessionId();
    const isReturningUser =
      sessionStorage.getItem(`room_${drawingId}_visited`) === "true";

    socketRef.current = io(import.meta.env.VITE_APP_BASE_URL_BACKEND, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", {
        roomId: drawingId,
        userId: user?._id || null,
        isAdmin: true,
        socketId: socket.id,
        isLogin: user ? true : false,
        sessionId,
        isReturningUser,
      });

      sessionStorage.setItem(`room_${drawingId}_visited`, "true");

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

    socket.on("room-users", (users) => {
      console.log(users);
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
      console.log(connectUsersToDrawing);
      setConnectedUsers(connectUsersToDrawing);
    });

    socket.on("user-joined", (data) => {
      const { socketId, islogin, isAdmin, isNewUser, sessionId, sessionName } =
        data;
      console.log("User joined:", socketId, isNewUser);

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
              socketId,
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
                socketId,
              },
            ];
          }
          return prev;
        });
      }
    });

    socket.on("user-left", (data) => {
      const { sessionId, hasLeftSession } = data;
      console.log("User left:", sessionId);

      if (hasLeftSession) {
        toast.info("A user left the drawing", {
          position: "bottom-right",
          autoClose: 1500,
        });
        setConnectedUsers((prev) =>
          prev.filter((user) => user.id !== sessionId)
        );
      }
    });

    socket.on(
      "drawing-update",
      (data: { elements: readonly ExcalidrawElement[]; userId: string }) => {
        if (data.userId === socket.id) {
          console.log("Ignoring own update");
          return;
        }

        console.log("Received remote update");
        setIsReceivingUpdate(true);
        updateSceneWithRetry(data.elements);

        setTimeout(() => setIsReceivingUpdate(false), 150);
      }
    );

    socket.on("canvas-cleared", (data: { userId: string }) => {
      if (data.userId !== socket.id) {
        if (excalidrawAPIRef.current) {
          isProcessingRemoteUpdate.current = true;
          excalidrawAPIRef.current.updateScene({ elements: [] });
          setTimeout(() => {
            isProcessingRemoteUpdate.current = false;
          }, 100);
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
  }, [drawingId, user?._id]);

  useEffect(() => {
    const isCollabrating = getCookie("collaborating");
    if (isCollabrating) {
      setIsCollabrating(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      getDrawing();
    }
  }, [user]);

  // FIX: Improved save logic with hash comparison
  useEffect(() => {
    const updateDrawing = async () => {
      if (
        !debouncedSceneElements ||
        !initialDrawings ||
        isReceivingUpdate ||
        isProcessingRemoteUpdate.current ||
        !isInitialLoadComplete.current
      ) {
        return;
      }

      const currentHash = createElementsHash(debouncedSceneElements);

      if (currentHash === lastSavedElementsHash.current) {
        console.log("No changes detected (hash match), skipping save");
        return;
      }

      setSaving(true);

      try {
        const currentElements =
          excalidrawAPIRef.current?.getSceneElements() ?? [];

        broadcastDrawingUpdate(currentElements);

        await Axios.post(`/api/update-drawing?id=${drawingId}`, {
          drawings: currentElements,
        });

        lastSavedElementsHash.current = currentHash;
        setLastSaved(new Date());
      } catch (error) {
        console.log("Save error:", error);
        toast.error("Failed to save drawing", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setSaving(false);
      }
    };

    const saveTimer = setTimeout(updateDrawing, 100);
    return () => clearTimeout(saveTimer);
  }, [
    debouncedSceneElements,
    initialDrawings,
    isReceivingUpdate,
    drawingId,
    isCollabrating,
  ]);

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
      <CustomHeader
        onCollaborateStart={(status) => {
          setIsCollabrating(status);
        }}
        saving={saving}
        lastSaved={lastSaved}
        isConnected={isConnected}
        connectedUsers={connectedUsers}
        navigate={() => {
          navigate("/dashboard");
        }}
        clearCanvasForAll={clearCanvasForAll}
        shareLink={`${
          import.meta.env.VITE_APP_BASE_URL_FRONTEND
        }/draw/shared?id=${drawingId}`}
        setShowDeleteConfirm={setShowDeleteConfirm}
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
      <DeleteDrawingModal
        deleteDrawing={deleteDrawing}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
      />

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
