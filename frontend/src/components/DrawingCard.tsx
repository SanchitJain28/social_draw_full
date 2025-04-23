import { h4, normalInput, primaryButton } from "../Themeclasses";
import { Axios } from "../ApiFormat";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
interface formProps {
  title: string;
}

export default function DrawingCard() {
  const { register, handleSubmit } = useForm<formProps>();
  const navigate = useNavigate();
  const createDrawing = async (data: formProps) => {
    try {
      const response = await Axios.post("/api/create-drawing", data);
      console.log(response);
      navigate(`/draw?id=${response.data.data._id}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="">
      <form onSubmit={handleSubmit(createDrawing)}>
        <div className="border border-zinc-700 rounded-lg p-4 w-1/3">
          <div className="p-4">
            <p className={h4 + "my-4"}>Title</p>
            <input
              className={normalInput + "w-full"}
              {...register("title")}
            ></input>
            <button className={primaryButton} type="submit">
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
