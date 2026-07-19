package com.weblocal.freelanceos.video;

import com.weblocal.freelanceos.video.entity.RoomParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, Long> {
    List<RoomParticipant> findByRoomIdAndLeftAtIsNullOrderByJoinedAtAsc(Long roomId);
}
