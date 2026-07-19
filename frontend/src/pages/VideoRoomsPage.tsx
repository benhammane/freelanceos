import { useState, useEffect } from 'react';
import { Plus, Phone, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

interface VideoRoom {
  id: number;
  name: string;
  description?: string;
  status: 'AWAITING' | 'ACTIVE' | 'ENDED' | 'ARCHIVED';
  createdAt: string;
  participantCount: number;
}

export function VideoRoomsPage() {
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      // Mock data - sera remplacé par API réelle
      const mockRooms: VideoRoom[] = [
        {
          id: 1,
          name: 'Réunion Client - Acme Corp',
          description: 'Présentation du projet',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          participantCount: 2,
        },
        {
          id: 2,
          name: 'Sync Équipe Hebdo',
          description: '',
          status: 'ENDED',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          participantCount: 5,
        },
      ];
      setRooms(mockRooms);
    } catch (err) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Room name required');
      return;
    }

    try {
      const newRoom: VideoRoom = {
        id: Math.floor(Math.random() * 10000),
        name: formData.name,
        description: formData.description,
        status: 'AWAITING',
        createdAt: new Date().toISOString(),
        participantCount: 1,
      };

      setRooms(prev => [newRoom, ...prev]);
      setShowForm(false);
      setFormData({ name: '', description: '' });
      toast.success('Réunion créée! 🎉');

      // Auto-redirect pour démarrer la réunion
      setTimeout(() => {
        window.location.href = `/video/${newRoom.id}`;
      }, 500);
    } catch (err) {
      toast.error('Failed to create room');
    }
  };

  const handleJoinRoom = (roomId: number) => {
    window.location.href = `/video/${roomId}`;
  };

  const handleDelete = async (roomId: number) => {
    try {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      toast.success('Réunion supprimée');
    } catch (err) {
      toast.error('Failed to delete room');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'AWAITING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '🟢 En cours';
      case 'AWAITING':
        return '🔵 En attente';
      case 'ENDED':
        return '⚪ Terminée';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-fg">Vidéoconférences</h1>
            <p className="text-fg/60 mt-2">Créez et rejoignez des réunions en temps réel</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle réunion
          </Button>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-12 text-fg/60">Chargement...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-fg/30 mx-auto mb-4" />
            <p className="text-fg/60">Aucune réunion pour le moment</p>
            <p className="text-sm text-fg/40 mt-2">Créez-en une nouvelle pour commencer</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map(room => (
              <div
                key={room.id}
                className="bg-surface border border-border rounded-lg p-6 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-fg">{room.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(room.status)}`}>
                        {getStatusLabel(room.status)}
                      </span>
                    </div>

                    {room.description && (
                      <p className="text-fg/70 mb-3">{room.description}</p>
                    )}

                    <div className="flex gap-6 text-sm text-fg/60">
                      <span>👤 {room.participantCount} participant{room.participantCount > 1 ? 's' : ''}</span>
                      <span>📅 {new Date(room.createdAt).toLocaleString('fr-FR')}</span>
                      <span>🔗 Lien: localhost:5173/video/{room.id}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleJoinRoom(room.id)}
                      className="flex gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Phone className="w-4 h-4" />
                      Rejoindre
                    </Button>
                    <Button
                      onClick={() => handleDelete(room.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Room Modal */}
        {showForm && (
          <Modal title="Créer une réunion vidéo" onClose={() => setShowForm(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">Nom de la réunion *</label>
                <input
                  type="text"
                  placeholder="Ex: Réunion Client - Acme"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded bg-app-bg text-fg placeholder-fg/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">Description (optionnelle)</label>
                <textarea
                  placeholder="Ex: Présentation du projet Q3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded bg-app-bg text-fg placeholder-fg/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  💡 Vous serez redirigé vers la réunion après sa création
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Créer et démarrer
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
