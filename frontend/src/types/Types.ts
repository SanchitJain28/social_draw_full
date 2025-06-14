export interface CollaborativeUser {
  id: string;
  socketId:string
  name?: string;
  color: string;
  cursor?: { x: number; y: number };
  isVerified: boolean;
  isAdmin: boolean;
}