package com.weblocal.freelanceos.event;

import com.weblocal.freelanceos.event.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUserIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(Long userId, LocalDateTime start, LocalDateTime end);
    List<Event> findByRelatedResourceTypeAndRelatedResourceIdOrderByStartDateTimeAsc(String resourceType, Long resourceId);
    Page<Event> findByUserIdOrderByStartDateTimeAsc(Long userId, Pageable pageable);
    boolean existsByIdAndUserId(Long id, Long userId);
}
