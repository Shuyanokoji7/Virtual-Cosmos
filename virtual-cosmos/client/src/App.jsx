import React, { useState, useCallback } from 'react';
import LobbyScreen from './components/LobbyScreen';
import CosmosCanvas from './components/CosmosCanvas';
import ChatPanel from './components/ChatPanel';
import StatusBar from './components/StatusBar';
import UserList from './components/UserList';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);

  const {
    socket,
    myData,
    otherUsers,
    activeConnections,
    chatMessages,
    sendMessage,
    sendPosition,
  } = useSocket(joined, username);

  const handleJoin = useCallback((name) => {
    setUsername(name);
    setJoined(true);
  }, []);

  if (!joined) {
    return <LobbyScreen onJoin={handleJoin} />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-cosmos-bg">
      {/* Main Canvas */}
      <CosmosCanvas
        myData={myData}
        otherUsers={otherUsers}
        activeConnections={activeConnections}
        onMove={sendPosition}
      />

      {/* Status Bar */}
      <StatusBar
        username={myData?.username}
        userCount={otherUsers.length + 1}
        connectionCount={activeConnections.length}
      />

      {/* Online Users */}
      <UserList users={otherUsers} myData={myData} />

      {/* Chat Panels */}
      {activeConnections.map((conn) => (
        <ChatPanel
          key={conn.roomId}
          roomId={conn.roomId}
          peerName={conn.peerName}
          peerColor={conn.peerColor}
          messages={chatMessages[conn.roomId] || []}
          mySocketId={myData?.socketId}
          onSend={(content) => sendMessage(conn.roomId, content)}
        />
      ))}
    </div>
  );
}
