"use client";

import { Axios } from "@/ApiFormat";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
interface formProps {
  title: string;
}

export function ModalComponent({ isOpen }: { isOpen: boolean }) {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(isOpen);
  const { register, handleSubmit } = useForm<formProps>();

  const createDrawing = async (data: formProps) => {
    try {
      const response = await Axios.post("/api/create-drawing", data);
      console.log(response);
      setOpenModal(false);
      navigate(`/draw?id=${response.data.data._id}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Button onClick={() => setOpenModal(true)}>Create a drawing</Button>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader>Create a drawing</ModalHeader>
        <form onSubmit={handleSubmit(createDrawing)}>
          <ModalBody>
            <div className="border border-zinc-700 rounded-lg ">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="draw_name">Drawing name</Label>
                </div>
                <TextInput
                  id="draw_name"
                  type="text"
                  placeholder="My first drawing 😀"
                  {...register("title")}
                  required
                />
              </div>
  
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="submit">Create</Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              Decline
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
