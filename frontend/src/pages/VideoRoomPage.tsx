import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, Share2, XCircle, X, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VideoTile } from '../components/video/VideoTile';
import { useWebRTC } from '../hooks/useWebRTC';
import toast from 'react-hot-toast';

export function VideoRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const {
    localStream,
    remoteStreams,
    participantCount,
    connected,
    audioEnabled,
    videoEnabled,
    screenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC(roomId ?? '');

  const remotePeerIds = Object.keys(remoteStreams);

  // Grille adaptative : le nombre de colonnes s'ajuste au nombre de participants.
  const gridCols =
    participantCount <= 1
      ? 'grid-cols-1'
      : participantCount <= 4
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Lien copié dans le presse-papiers');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHangUp = () => navigate('/video-rooms');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* En-tête */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Réunion #{roomId}</h1>
          <p className="text-gray-400 text-sm">
            <span className={connected ? 'text-green-400' : 'text-amber-400'}>
              {connected ? '🟢 En cours' : '🟡 Connexion…'}
            </span>{' '}
            — {participantCount} participant{participantCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyLink} variant="outline" className="flex gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Inviter
          </Button>
          <Button onClick={handleHangUp} variant="outline" className="flex gap-2">
            <X className="w-4 h-4" />
            Quitter
          </Button>
        </div>
      </div>

      {/* Grille vidéo */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={`grid ${gridCols} gap-4 max-w-6xl mx-auto`}>
          <VideoTile
            stream={localStream}
            label="👤 Vous"
            muted
            mirrored={!screenSharing}
            badges={
              <>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium ${audioEnabled ? 'bg-blue-600' : 'bg-red-600'}`}
                >
                  {audioEnabled ? '🎙️' : '🔇'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium ${videoEnabled ? 'bg-blue-600' : 'bg-red-600'}`}
                >
                  {videoEnabled ? '📷' : '📹'}
                </span>
                {screenSharing && <span className="px-2.5 py-1 rounded text-xs font-medium bg-amber-600">📺</span>}
              </>
            }
          />

          {remotePeerIds.map((peerId, index) => (
            <VideoTile key={peerId} stream={remoteStreams[peerId]} label={`👥 Participant ${index + 1}`} />
          ))}
        </div>

        {/* Message d'attente quand on est seul */}
        {remotePeerIds.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p className="font-medium">En attente d'autres participants…</p>
            <p className="text-xs mt-1 text-gray-500">Partagez le lien de la réunion pour inviter quelqu'un.</p>
            <button
              onClick={copyLink}
              className="mt-3 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 rounded px-3 py-2 font-mono text-xs text-blue-400 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {window.location.href}
            </button>
          </div>
        )}
      </div>

      {/* Barre de contrôle */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-6 flex justify-center gap-4">
        <Button
          onClick={toggleAudio}
          className={`rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg ${
            audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
          }`}
          title={audioEnabled ? 'Désactiver le micro' : 'Activer le micro'}
        >
          {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>

        <Button
          onClick={toggleVideo}
          className={`rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg ${
            videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
          }`}
          title={videoEnabled ? 'Désactiver la caméra' : 'Activer la caméra'}
        >
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>

        <Button
          onClick={toggleScreenShare}
          className={`rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-lg ${
            screenSharing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={screenSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
        >
          {screenSharing ? <XCircle className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
        </Button>

        <Button
          onClick={handleHangUp}
          className="rounded-full w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all shadow-lg"
          title="Terminer l'appel"
        >
          <Phone className="w-6 h-6" />
        </Button>
      </div>

      {/* Bandeau d'info */}
      <div className="bg-gray-950 border-t border-gray-800 px-6 py-3 text-center text-sm text-gray-400">
        💡 <span className="text-blue-400">WebRTC</span> — connexion directe pair-à-pair, chiffrée de bout en bout
      </div>
    </div>
  );
}
