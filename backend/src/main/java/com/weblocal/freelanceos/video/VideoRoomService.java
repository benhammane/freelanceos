package com.weblocal.freelanceos.video;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.auth.UserRepository;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.video.entity.VideoRoom;
import com.weblocal.freelanceos.video.entity.RoomParticipant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor @Transactional
public class VideoRoomService {
    private final VideoRoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomParticipantRepository participantRepository;

    public Page<VideoRoom> getUserRooms(Long userId, Pageable pageable) {
        return roomRepository.findByCreatorIdOrderByDateCreationDesc(userId, pageable);
    }

    public VideoRoom getRoom(Long id) {
        return roomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
    }

    public VideoRoom createRoom(String name, String description, Long userId) {
        User creator = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VideoRoom room = new VideoRoom();
        room.setName(name);
        room.setDescription(description);
        room.setCreator(creator);
        room.setStatus(VideoRoom.RoomStatus.AWAITING);
        return roomRepository.save(room);
    }

    public RoomParticipant joinRoom(Long roomId, Long userId, String displayName) {
        VideoRoom room = getRoom(roomId);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RoomParticipant participant = new RoomParticipant();
        participant.setRoom(room);
        participant.setUser(user);
        participant.setDisplayName(displayName);
        participant.setJoinedAt(LocalDateTime.now());

        if (room.getStatus() == VideoRoom.RoomStatus.AWAITING) {
            room.setStatus(VideoRoom.RoomStatus.ACTIVE);
            room.setStartedAt(LocalDateTime.now());
            roomRepository.save(room);
        }

        return participantRepository.save(participant);
    }

    public void leaveRoom(Long participantId) {
        RoomParticipant participant = participantRepository.findById(participantId).orElseThrow(() -> new ResourceNotFoundException("Participant not found"));
        participant.setLeftAt(LocalDateTime.now());
        participantRepository.save(participant);
    }

    public List<RoomParticipant> getRoomParticipants(Long roomId) {
        return participantRepository.findByRoomIdAndLeftAtIsNullOrderByJoinedAtAsc(roomId);
    }

    public void deleteRoom(Long id, Long userId) {
        VideoRoom room = getRoom(id);
        if (!room.getCreator().getId().equals(userId)) throw new ResourceNotFoundException("Room not found");
        room.setStatus(VideoRoom.RoomStatus.ARCHIVED);
        roomRepository.save(room);
    }
}
