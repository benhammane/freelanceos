import { useEffect, useRef } from 'react';

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  mirrored?: boolean;
  badges?: React.ReactNode;
}

/**
 * Affiche un flux vidéo (local ou distant) dans une tuile.
 *
 * Une balise <video> ne peut pas recevoir un MediaStream via une prop React :
 * on doit l'assigner impérativement à l'élément DOM via srcObject, d'où le ref
 * et l'effet. `muted` est indispensable sur SA PROPRE vidéo pour éviter le
 * larsen (on ne veut pas s'entendre soi-même).
 */
export function VideoTile({ stream, label, muted = false, mirrored = false, badges }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-950 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="text-gray-500 text-sm">Connexion…</div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1.5 rounded text-white font-semibold text-sm">
        {label}
      </div>
      {badges && <div className="absolute top-3 right-3 flex gap-2">{badges}</div>}
    </div>
  );
}
