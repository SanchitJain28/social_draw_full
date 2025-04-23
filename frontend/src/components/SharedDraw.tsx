import { useEffect, useState } from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from 'react-router';
import { Axios } from '../ApiFormat';
import { h2, Primarypara, Secondarypara } from '../Themeclasses';
import { ExcalidrawInitialDataState,} from '@excalidraw/excalidraw/types';
import { Drawing } from './Dashboard';
import {  ExcalidrawElement, OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';

// import { socket } from '../Socket';
export default function SharedDraw() {
    const [saving, setSaving] = useState<boolean>(false)
    const [searchParams] = useSearchParams();
    const [initialDrawings, setInitialDrawings] = useState<ExcalidrawInitialDataState | null>(null)
    const [drawingData, setDrawingData] = useState<Drawing | null>(null)
    const [sceneElements, setSceneElements] = useState<readonly OrderedExcalidrawElement[] | null | undefined>()
    const debouncedSceneElements = useDebounce(sceneElements, 1000);
    
    useEffect(() => {
        getDrawing() // get initial drawing data from API when component mounts
        // console.log(searchParams.get("id")) // print the id from the URL parameter
        console.log(searchParams.get("id"))
        // socket.emit("join room",searchParams.get("groupid"))
        // socket.on("draw", (data) => {
        //     console.log(data)
        //   });
    }, [])
    const getDrawing = async () => {
        try {
            const response = await Axios.get(`/api/single-drawing?id=${searchParams.get("id")}`)
            const { data } = response.data
            console.log(data)
            setDrawingData(data[0])
            setInitialDrawings(data[0].elements)
            setSceneElements(data[0].elements)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        const updateDrawing = async () => {
            if (debouncedSceneElements && initialDrawings) {
                setSaving(true)
                // setSceneElements(excalidrawAPI.getSceneElements())
                try {
                    const response = await Axios.post(`/api/update-drawing-shared?id=${searchParams.get("id")}`, {
                        drawings: sceneElements
                    })
                    console.log(response)
                    // socket.emit("draw", { roomId:searchParams.get("groupid"), data: response.data.data.elements });
                    console.log(sceneElements)
                } catch (error) {
                    console.log(error)
                }
                finally {
                    setSaving(false)
                }
            }
        }
        updateDrawing()
    }, [debouncedSceneElements])
    const handleOnchange = (excalidrawElements:readonly ExcalidrawElement[] | null) => {
        setSceneElements(excalidrawElements as readonly OrderedExcalidrawElement[] | null)
    }
    if (!initialDrawings) {
        return <div>
            <p className={h2}>Loading...</p>
        </div>
    }
    return (
        <div className='bg-[#121212]'>
            <div className="border-b border-zinc-600 flex items-center px-8 py-4 justify-between">
                <p className={Primarypara}>{drawingData?.title}</p>
                <p className={Secondarypara}>{saving ? "Saving on cloud" : ""}</p>
            </div>
            <div style={{ height: "100vh", borderRadius: "0px" }} className='custom-styles rounded-full '>
                {initialDrawings && <Excalidraw
                    theme='dark'
                    initialData={{
                        elements: [
                          ...(Array.isArray(initialDrawings) ? initialDrawings : [])
                        ]
                      }}
                    // excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    onChange={handleOnchange} />}
            </div>
        </div>
    )
}
