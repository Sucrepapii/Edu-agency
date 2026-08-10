import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server side Pusher instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

// Client side Pusher instance
export const getPusherClient = () => {
  if (typeof window !== 'undefined') {
    return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    });
  }
  return null;
};
