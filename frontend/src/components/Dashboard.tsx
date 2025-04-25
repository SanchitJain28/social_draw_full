import { useEffect, useState } from "react";
import { h2, h3, Primarypara } from "../Themeclasses";
import { Axios } from "../ApiFormat";
import { useNavigate } from "react-router";
import DrawingCard from "./DrawingCard";

// import { socket } from '../Socket'
export interface elementProps {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  opacity: number;
  groupIds: string[];
  frameId: null;
  index: string;
  roundness: Roundness;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  updated: number;
  link: null;
  locked: boolean;
  boundElements?: { id: string; type: string }[] | null;
}

export interface Roundness {
  type: number;
}

export interface Drawing {
  createdAt: Date;
  _id: string;
  title: string;
  elements: elementProps[];
}
export default function Dashboard() {
  // const [isConnected, setIsConnected] = useState(socket.connected);
  const navigate = useNavigate();

  const [drawings, setDrawings] = useState<Drawing[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const Fetchdrawings = async () => {
    setLoading(true);
    try {
      const { data } = await Axios.get("/api/get-drawings");
      console.log(data);
      setDrawings(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    Fetchdrawings();
  }, []);
  if (loading) {
    return <p className={h3}>Loading...</p>;
  }
  return (
    <div className="p-8">
      <p className={h2 + "my-4"}>Create a Drawing</p>
      <DrawingCard/>
      <div className="grid lg:grid-cols-3 grid-cols-1">
        {drawings &&
          drawings.map((e, index: number) => {
            return (
              <div
                key={index}
                onClick={() => {
                  navigate(`/draw?id=${e._id}`);
                }}
                className="border border-zinc-600 rounded-xl p-4 my-4 mr-4"
              >
                <p className={Primarypara + ""}>{e.title}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
