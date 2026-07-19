import { useState, useEffect, useCallback } from 'react';
import type { RoomParticipant } from '../types/VideoRoom';
import toast from 'react-hot-toast';

export function useWebRTC(_roomId: number) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants] = useState<RoomParticipant[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: 1280, height: 720 }
        });
        setLocalStream(stream);
      } catch (err) {
        toast.error('Failed to access camera/microphone');
      }
    };

    initMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  }, [localStream, audioEnabled]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  }, [localStream, videoEnabled]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenSharing(true);
      return screenStream;
    } catch (err) {
      toast.error('Screen sharing failed');
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    setScreenSharing(false);
  }, []);

  return {
    localStream,
    participants,
    audioEnabled,
    videoEnabled,
    screenSharing,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
}
