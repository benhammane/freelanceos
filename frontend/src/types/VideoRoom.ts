export interface VideoRoom {
  id: number;
  dateCreation: string;
  name: string;
  description?: string;
  creatorId: number;
  status: 'AWAITING' | 'ACTIVE' | 'ENDED' | 'ARCHIVED';
  startedAt?: string;
  endedAt?: string;
  maxParticipants?: number;
}

export interface RoomParticipant {
  id: number;
  displayName: string;
  joinedAt: string;
  leftAt?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareActive: boolean;
}
