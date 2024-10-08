import { boot } from 'quasar/wrappers'
import io from 'socket.io-client';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
const URL = 'http://192.168.100.32:3001';
const socket = io(URL);

export default boot(({}) => {
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
  // something to do
})

export { socket };
