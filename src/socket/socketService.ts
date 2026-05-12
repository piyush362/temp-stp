import {io, Socket} from 'socket.io-client';
import {BASEURL} from '../../app.env';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(BASEURL);

    socket.on('connect', () => console.log('🔌 Socket connected'));
    socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
  }
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error('Socket not connected');
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket forcefully disconnected');
  }
};
