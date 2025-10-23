import { boot } from 'quasar/wrappers'
import io from 'socket.io-client';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
// const URL = 'http://192.168.100.32:3001';
const URL = 'https://socket.sumitronics-indonesia.com';
// const socket = io(URL);
const socket = io(URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  secure: true,
  rejectUnauthorized: false,
});

export default boot(({ }) => {
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
  // something to do
})

export { socket };
