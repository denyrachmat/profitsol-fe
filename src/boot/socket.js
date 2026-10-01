import { boot } from "quasar/wrappers";
import io from "socket.io-client";
import { getRuntimeConfig } from "src/runtimeConfig";

let connection = null;
const listeners = [];
const socket = {
  on(event, handler) {
    listeners.push(["on", event, handler]);
    connection?.on(event, handler);
    return this;
  },
  off(event, handler) {
    connection?.off(event, handler);
    return this;
  },
  emit(...args) {
    connection?.emit(...args);
    return this;
  },
  connect() {
    connection?.connect();
    return this;
  },
  disconnect() {
    connection?.disconnect();
    return this;
  },
  onAny(handler) {
    listeners.push(["onAny", handler]);
    connection?.onAny(handler);
    return this;
  },
};

export const connectSocket = (url = getRuntimeConfig("SOCKET_URL")) => {
  if (connection?.io?.uri === url) return socket;
  connection?.disconnect();
  connection = null;
  if (!url) return socket;
  connection = io(url, {
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
    secure: true,
  });
  listeners.forEach(([method, ...args]) => connection[method](...args));
  return socket;
};

export default boot(() => {
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
  connectSocket();
});

export { socket };
