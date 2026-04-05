import React from 'react';
import { useCosmosStore } from './store';
import { useSocket } from './hooks/useSocket';
import LobbyScreen from './components/LobbyScreen';
import CosmosCanvas from './components/CosmosCanvas';
import StatusBar from './components/StatusBar';
import ChatPanel from './components/ChatPanel';
import GlobalChat from './components/GlobalChat';
import UserList from './components/UserList';
import VideoCallOverlay from './components/VideoCallOverlay';
import CreateRoomModal from './components/CreateRoomModal';
import Minimap from './components/Minimap';

function App() {
  const { isJoined, activeChatRoom, isGlobalChatOpen, activeCall } = useCosmosStore();
  const { socket, emit, on, off } = useSocket();
  const [showCreateRoom, setShowCreateRoom] = React.useState(false);

  if (!isJoined) {
    return <LobbyScreen emit={emit} />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-cosmos-bg relative">
      {/* Main Canvas */}
      <CosmosCanvas emit={emit} socket={socket} />

      {/* UI Overlay */}
      <StatusBar 
        onCreateRoom={() => setShowCreateRoom(true)} 
        emit={emit}
      />

      {/* User List Panel */}
      <UserList emit={emit} socket={socket} />

      {/* Proximity Chat Panel */}
      {activeChatRoom && (
        <ChatPanel 
          roomId={activeChatRoom}
          emit={emit}
          socket={socket}
        />
      )}

      {/* Global Chat Panel */}
      {isGlobalChatOpen && (
        <GlobalChat 
          emit={emit}
        />
      )}

      {/* Video Call Overlay */}
      {activeCall && (
        <VideoCallOverlay socket={socket} />
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal 
          onClose={() => setShowCreateRoom(false)}
          emit={emit}
        />
      )}

      {/* Minimap */}
      <Minimap />
    </div>
  );
}

export default App;
