import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook de visioconférence WebRTC en topologie "mesh".
 *
 * Chaque participant ouvre une connexion pair-à-pair directe (RTCPeerConnection)
 * avec chacun des autres participants de la salle. Un serveur WebSocket de
 * signaling (côté backend, /ws/signaling) sert uniquement à s'échanger les
 * offres/réponses SDP et les candidats ICE nécessaires pour établir ces
 * connexions ; l'audio/vidéo transite ensuite directement entre navigateurs.
 *
 * Convient aux petites réunions (2 à 4 personnes). Au-delà, le nombre de
 * connexions par participant devient coûteux et une architecture SFU serait
 * préférable.
 */

const CLE_STOCKAGE_SESSION = 'freelanceos.session';

// Serveurs STUN publics de Google : aident chaque pair à découvrir son adresse
// publique pour traverser la plupart des NAT/routeurs. Pour des réseaux très
// restrictifs (NAT symétrique), un serveur TURN (relais) serait nécessaire.
const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

function resolveSignalingUrl(roomId: string, token: string): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
  const wsBase = apiUrl.replace(/^http/, 'ws');
  return `${wsBase}/ws/signaling?roomId=${encodeURIComponent(roomId)}&token=${encodeURIComponent(token)}`;
}

function readToken(): string | null {
  const brut = localStorage.getItem(CLE_STOCKAGE_SESSION);
  if (!brut) return null;
  try {
    return (JSON.parse(brut) as { token: string }).token;
  } catch {
    return null;
  }
}

export function useWebRTC(roomId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  // peerId -> flux distant. Un objet simple (et non un Map) pour déclencher les
  // re-rendus React proprement via une nouvelle référence à chaque changement.
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});

  const sendSignal = useCallback((message: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  const removePeer = useCallback((peerId: string) => {
    const pc = peersRef.current[peerId];
    if (pc) {
      pc.close();
      delete peersRef.current[peerId];
    }
    setRemoteStreams((prev) => {
      if (!(peerId in prev)) return prev;
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  }, []);

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_CONFIG);

      // On attache nos pistes locales (micro + caméra) à envoyer au pair.
      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // Chaque candidat ICE découvert est relayé au pair via le signaling.
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({ type: 'ice-candidate', target: peerId, payload: event.candidate });
        }
      };

      // Réception du flux distant : on l'expose pour l'afficher dans une balise <video>.
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
          removePeer(peerId);
        }
      };

      peersRef.current[peerId] = pc;
      return pc;
    },
    [sendSignal, removePeer],
  );

  // Initialise la caméra/micro puis la connexion de signaling.
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const token = readToken();
      if (!token) {
        toast.error('Session expirée, reconnectez-vous.');
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: 1280, height: 720 },
        });
      } catch {
        toast.error("Impossible d'accéder à la caméra/microphone. Vérifiez les permissions.");
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const ws = new WebSocket(resolveSignalingUrl(roomId, token));
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => toast.error('Erreur de connexion au serveur de visioconférence.');

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          // À notre arrivée, on reçoit la liste des pairs déjà présents : c'est
          // NOUS qui initions une offre vers chacun (évite les offres croisées).
          case 'welcome': {
            for (const peerId of msg.peers as string[]) {
              const pc = createPeerConnection(peerId);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendSignal({ type: 'offer', target: peerId, payload: offer });
            }
            break;
          }

          // Un nouveau pair est arrivé : on attend simplement son offre.
          case 'peer-joined':
            break;

          // Offre reçue d'un pair : on crée la connexion côté récepteur et on répond.
          case 'offer': {
            const from = msg.from as string;
            const pc = peersRef.current[from] ?? createPeerConnection(from);
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal({ type: 'answer', target: from, payload: answer });
            break;
          }

          // Réponse à notre offre : on finalise la description distante.
          case 'answer': {
            const pc = peersRef.current[msg.from as string];
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            }
            break;
          }

          // Candidat ICE d'un pair : on l'ajoute à la connexion correspondante.
          case 'ice-candidate': {
            const pc = peersRef.current[msg.from as string];
            if (pc) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
              } catch {
                /* candidat obsolète/ignoré */
              }
            }
            break;
          }

          // Un pair a quitté la salle : on ferme et nettoie sa connexion.
          case 'peer-left':
            removePeer(msg.peerId as string);
            break;
        }
      };
    };

    start();

    return () => {
      cancelled = true;
      wsRef.current?.close();
      wsRef.current = null;
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !audioEnabled;
    stream.getAudioTracks().forEach((t) => (t.enabled = next));
    setAudioEnabled(next);
  }, [audioEnabled]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !videoEnabled;
    stream.getVideoTracks().forEach((t) => (t.enabled = next));
    setVideoEnabled(next);
  }, [videoEnabled]);

  // Remplace la piste vidéo envoyée à TOUS les pairs par celle de l'écran (ou
  // inversement pour revenir à la caméra), via sender.replaceTrack : les
  // connexions restent établies, seule la source vidéo change.
  const replaceVideoTrackForAllPeers = useCallback((track: MediaStreamTrack) => {
    Object.values(peersRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      sender?.replaceTrack(track);
    });
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (screenSharing) {
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) replaceVideoTrackForAllPeers(cameraTrack);
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];
      replaceVideoTrackForAllPeers(screenTrack);
      setScreenSharing(true);

      // Si l'utilisateur arrête le partage via la barre native du navigateur.
      screenTrack.onended = () => {
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        if (cameraTrack) replaceVideoTrackForAllPeers(cameraTrack);
        screenStreamRef.current = null;
        setScreenSharing(false);
      };
    } catch {
      toast.error("Impossible de partager l'écran.");
    }
  }, [screenSharing, replaceVideoTrackForAllPeers]);

  return {
    localStream,
    remoteStreams,
    participantCount: 1 + Object.keys(remoteStreams).length,
    connected,
    audioEnabled,
    videoEnabled,
    screenSharing,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}
