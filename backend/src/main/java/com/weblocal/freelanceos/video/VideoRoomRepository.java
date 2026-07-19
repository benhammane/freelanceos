package com.weblocal.freelanceos.video;

import com.weblocal.freelanceos.video.entity.VideoRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRoomRepository extends JpaRepository<VideoRoom, Long> {
    Page<VideoRoom> findByCreatorIdOrderByDateCreationDesc(Long creatorId, Pageable pageable);
    List<VideoRoom> findByProjectIdOrderByDateCreationDesc(Long projectId);
    List<VideoRoom> findByClientIdOrderByDateCreationDesc(Long clientId);
    List<VideoRoom> findByEventIdOrderByDateCreationDesc(Long eventId);
}
