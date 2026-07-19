import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, Share2, XCircle, Settings, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export function VideoRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [roomName] = useState(`Réunion #${roomId}`);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera on mount
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: 1280, height: 720 }
        });
        localStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Set initial audio/video state based on stream
        stream.getAudioTracks().forEach(track => {
          track.enabled = audioEnabled;
        });
        stream.getVideoTracks().forEach(track => {
          track.enabled = videoEnabled;
        });

        setLoading(false);
        toast.success('Caméra activée');
      } catch (err) {
        setLoading(false);
        toast.error('Impossible d\'accéder à la caméra/microphone. Vérifiez les permissions.');
        console.error('Camera error:', err);
      }
    };

    initializeCamera();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
      toast.success(audioEnabled ? '🔇 Micro désactivé' : '🎙️ Micro activé');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
      toast.success(videoEnabled ? '📹 Caméra désactivée' : '📷 Caméra activée');
    }
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (screenRef.current) {
        screenRef.current.srcObject = null;
      }
      setScreenSharing(false);
      toast.success('Partage d\'écran arrêté');
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        screenStreamRef.current = screenStream;

        if (screenRef.current) {
          screenRef.current.srcObject = screenStream;
        }

        setScreenSharing(true);
        toast.success('Partage d\'écran démarré');

        // Stop sharing when user stops it from the browser dialog
        screenStream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          if (screenRef.current) {
            screenRef.current.srcObject = null;
          }
          toast.info('Partage d\'écran arrêté');
        };
      } catch (err) {
        toast.error('Impossible de partager l\'écran');
        console.error('Screen share error:', err);
      }
    }
  };

  const handleHangUp = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/video-rooms');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{roomName}</h1>
          <p className="text-gray-400 text-sm">🟢 En cours - 1 participant</p>
        </div>
        <Button
          onClick={() => navigate('/video-rooms')}
          variant="outline"
          className="flex gap-2"
        >
          <X className="w-4 h-4" />
          Quitter
        </Button>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-6 gap-6">
        {/* Local Video */}
        <div className="flex-1 max-w-2xl">
          {loading ? (
            <div className="aspect-video bg-gray-950 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Initialisation de la caméra...</p>
            </div>
          ) : (
            <div className="bg-gray-950 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded text-white font-semibold text-sm">
                👤 Vous
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded text-sm font-medium ${audioEnabled ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                  {audioEnabled ? '🎙️ Micro' : '🔇 Muet'}
                </span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${videoEnabled ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                  {videoEnabled ? '📷 Caméra' : '📹 Off'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Screen Share */}
        {screenSharing && (
          <div className="flex-1 max-w-2xl">
            <div className="bg-gray-950 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative">
              <video
                ref={screenRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded text-white font-semibold text-sm">
                📺 Partage d'écran
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      {!screenSharing && (
        <div className="px-6 py-4 text-center text-gray-400 text-sm">
          <p className="font-medium">Aucun autre participant pour le moment</p>
          <p className="text-xs mt-1 text-gray-500">Partagez ce lien:</p>
          <div className="mt-2 bg-gray-900 rounded p-2 font-mono text-xs text-gray-300 inline-block">
            <span className="text-blue-400">localhost:5173/video/{roomId}</span>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-6 flex justify-center gap-4">
        <Button
          onClick={toggleAudio}
          className={`rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg ${
            audioEnabled
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title={audioEnabled ? 'Désactiver le micro' : 'Activer le micro'}
        >
          {audioEnabled ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </Button>

        <Button
          onClick={toggleVideo}
          className={`rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg ${
            videoEnabled
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title={videoEnabled ? 'Désactiver la caméra' : 'Activer la caméra'}
        >
          {videoEnabled ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>

        <Button
          onClick={toggleScreenShare}
          className={`rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg ${
            screenSharing
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={screenSharing ? 'Arrêter le partage d\'écran' : 'Partager l\'écran'}
        >
          {screenSharing ? (
            <XCircle className="w-6 h-6" />
          ) : (
            <Share2 className="w-6 h-6" />
          )}
        </Button>

        <Button
          className="rounded-full w-14 h-14 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-all shadow-lg"
          title="Paramètres"
        >
          <Settings className="w-6 h-6" />
        </Button>

        <Button
          onClick={handleHangUp}
          className="rounded-full w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all shadow-lg"
          title="Terminer l'appel"
        >
          <Phone className="w-6 h-6" />
        </Button>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-950 border-t border-gray-800 px-6 py-3 text-center text-sm text-gray-400">
        💡 <span className="text-blue-400">WebRTC</span> en temps réel - Connexion directe P2P
      </div>
    </div>
  );
}
