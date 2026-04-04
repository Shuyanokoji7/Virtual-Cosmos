import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import { useCosmosStore } from '../store';
import { useWebRTC } from '../hooks/useWebRTC';

const VideoCallOverlay = ({ socket }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { activeCall, localStream, remoteStreams, users } = useCosmosStore();
  const { endCall, toggleMute, toggleVideo } = useWebRTC(socket);

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote videos
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([odestined, stream]) => {
      if (remoteVideoRefs.current[odestined]) {
        remoteVideoRefs.current[odestined].srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const handleToggleMute = () => {
    const newState = toggleMute();
    setIsMuted(!newState);
  };

  const handleToggleVideo = () => {
    const newState = toggleVideo();
    setIsVideoOff(!newState);
  };

  const handleEndCall = () => {
    if (activeCall) {
      endCall(activeCall.targetUserId);
    }
  };

  const getRemoteUserName = (odestined) => {
    const user = users.find((u) => u.odestined === odestined);
    return user?.name || 'Unknown';
  };

  if (!activeCall) return null;

  const isVideoCall = activeCall.type === 'video';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed z-50 ${
        isMinimized
          ? 'top-4 right-4 w-48'
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      }`}
    >
      <div
        className={`glass rounded-2xl overflow-hidden shadow-2xl ${
          isMinimized ? '' : 'w-[600px]'
        }`}
      >
        {/* Header */}
        <div className="bg-purple-900/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white font-medium">
              {isVideoCall ? 'Video Call' : 'Voice Call'}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Video Grid */}
        {!isMinimized && (
          <div className="p-4">
            <div className="video-grid">
              {/* Local Video */}
              <div className="video-container relative">
                {isVideoCall ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={isVideoOff ? 'hidden' : ''}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900/30">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Mic className={`w-8 h-8 text-white ${isMuted ? 'opacity-30' : ''}`} />
                    </div>
                  </div>
                )}
                {isVideoCall && isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <VideoOff className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                  You {isMuted && '(muted)'}
                </div>
              </div>

              {/* Remote Videos */}
              {Object.entries(remoteStreams).map(([odestined]) => (
                <div key={odestined} className="video-container relative">
                  {isVideoCall ? (
                    <video
                      ref={(el) => (remoteVideoRefs.current[odestined] = el)}
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-900/30">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                    {getRemoteUserName(odestined)}
                  </div>
                </div>
              ))}

              {Object.keys(remoteStreams).length === 0 && (
                <div className="video-container flex items-center justify-center bg-gray-900/50">
                  <div className="text-center text-gray-400">
                    <Phone className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm">Connecting...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-purple-900/30 px-4 py-4 flex items-center justify-center gap-4">
          {/* Mute Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </motion.button>

          {/* Video Toggle (only for video calls) */}
          {isVideoCall && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoOff
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </motion.button>
          )}

          {/* End Call Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCallOverlay;
