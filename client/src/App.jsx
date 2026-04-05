import React from "react";
import { useCosmosStore } from "./store";
import { useSocket } from "./hooks/useSocket";
import LobbyScreen from "./components/LobbyScreen";
import CosmosCanvas from "./components/CosmosCanvas";
import StatusBar from "./components/StatusBar";
import ChatPanel from "./components/ChatPanel";
import GlobalChat from "./components/GlobalChat";
import UserList from "./components/UserList";
import VideoCallOverlay from "./components/VideoCallOverlay";
import CreateRoomModal from "./components/CreateRoomModal";
import Minimap from "./components/Minimap";

function App() {
  const { isJoined, activeChatRoom, isGlobalChatOpen, activeCall } =
    useCosmosStore();
  const { socket, emit, on, off } = useSocket();
  const [showCreateRoom, setShowCreateRoom] = React.useState(false);

  if (!isJoined) {
    return <LobbyScreen emit={emit} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-cosmos-bg">
      {/* ✅ TOP BAR (takes real space) */}
      <StatusBar onCreateRoom={() => setShowCreateRoom(true)} emit={emit} />

      {/* ✅ MAIN AREA */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas */}
        <CosmosCanvas emit={emit} socket={socket} />

        {/* Overlays stay inside main area */}
        <UserList emit={emit} socket={socket} />

        {activeChatRoom && (
          <ChatPanel roomId={activeChatRoom} emit={emit} socket={socket} />
        )}

        {isGlobalChatOpen && <GlobalChat emit={emit} />}

        {activeCall && <VideoCallOverlay socket={socket} />}

        <Minimap />
      </div>

      {/* Modal (can stay outside) */}
      {showCreateRoom && (
        <CreateRoomModal onClose={() => setShowCreateRoom(false)} emit={emit} />
      )}
    </div>
  );
}

export default App;
