import React, { useEffect, useState } from 'react';
import { h2, primaryButton, Secondaryh3 } from '../Themeclasses';
import { useSearchParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
// import { socket } from '../Socket';
import Cookies from 'js-cookie';

export default function MakeRoom() {
  const [copied, setCopied] = useState(false);
  const [searchParams] = useSearchParams();
  const [link, setLink] = useState('');
  const isRoomId = Cookies.get("roomId")
  const [roomId, setRoomId] = useState('');
  const setRoomIdCookie = (id: string) => {
    Cookies.set('roomId', id, { expires: 1 })
  }
  useEffect(()=>{
    if(isRoomId){
      setRoomId(isRoomId)
    }
    setLink(`http://localhost:5173/draw/shared?id=${searchParams.get('id')}&groupid=${isRoomId}`);
  },[])
  const handleCopy = async () => {
    // Generate new room ID inside handleCopy
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setRoomIdCookie(newRoomId)
    // Generate the link
    const generatedLink = `http://localhost:5173/draw/shared?id=${searchParams.get('id')}&groupid=${newRoomId}`;
    setLink(generatedLink);

    try {
      // Copy the updated link
      await navigator.clipboard.writeText(generatedLink);

      // Emit the event AFTER setting roomId
      // socket.emit('join room', newRoomId);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="p-8">
      <p className={h2+"my-4"}>Make a room</p>
      {!isRoomId && <button className={primaryButton} onClick={handleCopy}>{isRoomId ? isRoomId : "Generate a link"}</button>
      }
      <p className={Secondaryh3}>{link ? `Your shared link: ${link}` : ''}</p>
    </div>
  );
}