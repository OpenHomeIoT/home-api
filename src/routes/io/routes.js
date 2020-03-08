import { getHomeConfigManagerInstance } from "../../manager/device/HomeConfigManager";
import getSocketConnectionDBInstance from "../../db/SocketConnectionDB";

const homeConfigManager = getHomeConfigManagerInstance();
const socketConnectionDB = getSocketConnectionDBInstance();

/**
 * Handle a new socket connection.
 * @param {SocketIO.Socket} socket the socket.
 */
function onConnection(socket) {
  // register routes
  socket.on("identification", (data) => onSocketIdentification(socket, data));
  socket.on("disconnect", function () {
    if (socketConnectionDB.exists(socket.id)) {
      socketConnectionDB.get(socket.id)
      .then((socketConnection) => socketConnection && homeConfigManager.setDeviceHasDisconnected(socketConnection.usn))
      .then(() => socketConnectionDB.delete(socket.id));
    }
  });

  socket.emit("identification");
  // TODO: load service routes serviceRoutes.apply(socket)
  setTimeout(function() {
    if (!socketConnectionDB.exists(socket.id)) {
      socket.disconnect();
    }
  }, 15000);
}

/**
 * Handle socket identification.
 * @param {SocketIO.Socket} socket the socket.
 * @param {{ usn: string }} data the identification data.
 */
const onSocketIdentification = (socket, { usn }) => {
  if (!usn) return;
  homeConfigManager.setDeviceHasConnected(usn, socket.id);
  socketConnectionDB.insert({ _id: socket.id, usn });
};

export { onConnection };
