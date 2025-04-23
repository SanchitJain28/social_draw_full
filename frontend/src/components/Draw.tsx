import { useEffect, useState } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawInitialDataState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { h2, primaryButton, Primarypara, Secondarypara } from '../Themeclasses';
import { useDebounce } from "@uidotdev/usehooks";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router';
import { Axios } from '../ApiFormat';
import { Drawing} from './Dashboard';
import { ExcalidrawElement, OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
export default function Draw() {
  //if there is a room
  // const [isRoomActive,setIsRoomActive]=useState("")
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  const navigate = useNavigate();
  const [saving, setSaving] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const [initialDrawings, setInitialDrawings] = useState<ExcalidrawInitialDataState | null>(null);
  const [drawingData, setDrawingData] = useState<Drawing | null>(null);
  const [sceneElements, setSceneElements] = useState<readonly OrderedExcalidrawElement[] | null | undefined>();
  const debouncedSceneElements = useDebounce(sceneElements, 1000);
  const notify = () => toast("Saving");
  const deleteDrawing = async () => {
    try {
      const response = await Axios.delete(`/api/delete-drawing?id=${searchParams.get("id")}`);
      console.log(response);
      navigate("/dashboard");
      toast("Drawing deleted successfully");
    } catch (error) {
      console.log(error);
    }
  };
  const getDrawing = async () => {
    try {
      const { data: { data } } = await Axios.get(`/api/single-drawing?id=${searchParams.get("id")}`);
      setDrawingData(data);
      setInitialDrawings(data.elements);
      setSceneElements(data.elements as readonly OrderedExcalidrawElement[] | null);
    } catch (error) {
      console.log(error);
    }
  };
  const handleOnchange = (elements: readonly ExcalidrawElement[] | null) => {
    setSceneElements(elements as readonly OrderedExcalidrawElement[] | null);
  };
  useEffect(() => {
    getDrawing(); // get initial drawing data from API when component mounts
    // console.log(searchParams.get("id")) // print the id from the URL parameter
    // if(Cookies.get("roomId")){
    //socket.on("draw", (data) => {
    //  console.log(data)
    //  setSceneElements(data)
    //  setTimeout(() => {
    // 0);
    // });
    // socket.emit('join room', Cookies.get("roomId"));
    // }
    console.log(initialDrawings);
    console.log(searchParams.get("id"));
  }, []);
  useEffect(() => {
    const updateDrawing = async () => {
      if (debouncedSceneElements && initialDrawings) {
        setSaving(true);
        // setSceneElements(excalidrawAPI.getSceneElements())
        try {
          const response = await Axios.post(`/api/update-drawing?id=${searchParams.get("id")}`, {
            drawings: debouncedSceneElements
          });
          console.log(response);
          console.log(excalidrawAPI);
          notify();
          console.log(debouncedSceneElements);
        } catch (error) {
          console.log(error);
        } finally {
          setSaving(false);
        }
      }
    };
    updateDrawing();
  }, [debouncedSceneElements]);

  if (!initialDrawings) {
    return <div>
      <p className={h2}>Loading...</p>
    </div>;
  }
  return (
    <div className='bg-[#121212]'>
      <div className="border-b border-zinc-600 flex items-center px-8 justify-between">
        <p className={Primarypara}>{drawingData?.title}</p>
        <button className={primaryButton} onClick={() => navigate(`/make-a-room?id=${searchParams.get("id")}`)}>Share</button>
        <p className={Secondarypara}>{saving ? "Saving" : ""}</p>
        <button className={primaryButton} onClick={deleteDrawing}>delete drawing</button>
      </div>
      <div style={{ height: "100vh", borderRadius: "0px" }} className='custom-styles rounded-full '>
        {initialDrawings && <Excalidraw

          theme='dark'
          initialData={{
            elements: [
              ...(Array.isArray(initialDrawings) ? initialDrawings : [])
            ]
          }}
          excalidrawAPI={(api) => {
            console.log(api + "API");
            setExcalidrawAPI(api);
          }}
          onChange={handleOnchange} />}
      </div>
      <ToastContainer
        autoClose={500} />
    </div>
  );
}