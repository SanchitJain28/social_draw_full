import {
  Button,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
} from "@headlessui/react";
import { useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router";
import { Axios } from "@/ApiFormat";
import { useForm } from "react-hook-form";
interface formProps {
  title: string;
}
export default function DrawingCard() {
  const { register, handleSubmit } = useForm<formProps>();

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  function open() {
    setIsOpen(true);
  }
  function close() {
    setIsOpen(false);
  }
  const createDrawing = async (data: formProps) => {
    try {
      const response = await Axios.post("/api/create-drawing", data);
      console.log(response);
      close();
      navigate(`/draw?id=${response.data.data._id}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Button
        onClick={open}
        className="rounded-xl bg-blue-600 px-4 py-4 text-lg font-medium text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-black/30"
      >
        create drawing
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <form onSubmit={handleSubmit(createDrawing)}>
                <DialogTitle
                  as="h3"
                  className="text-base/7 font-medium text-white"
                >
                  Create a drawing
                </DialogTitle>
                <Field className="my-4">
                  <Label className="text-sm/6 font-medium text-white">
                    Name
                  </Label>
                  <Description className="text-sm/6 text-white/50">
                    Give your drawing a name
                  </Description>
                  <Input
                    {...register("title")}
                    className={clsx(
                      "mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                      "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
                    )}
                  />
                </Field>

                <div className="mt-4">
                  <Button
                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                    type="submit"
                  >
                    create a drawing
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
