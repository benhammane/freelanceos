package com.weblocal.freelanceos.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByUserIdOrderByDateCreationDesc(Long userId, Pageable pageable);

    Page<ActivityLog> findByUserIdAndResourceTypeOrderByDateCreationDesc(
        Long userId, ActivityLog.ResourceType resourceType, Pageable pageable);

    Page<ActivityLog> findByUserIdAndCategoryOrderByDateCreationDesc(
        Long userId, ActivityLog.ActivityCategory category, Pageable pageable);

    Page<ActivityLog> findByUserIdAndActionOrderByDateCreationDesc(
        Long userId, ActivityLog.ActivityAction action, Pageable pageable);

    List<ActivityLog> findByUserIdAndDateCreationBetweenOrderByDateCreationDesc(
        Long userId, LocalDateTime startDate, LocalDateTime endDate);

    Page<ActivityLog> findByUserIdAndDescriptionContainsIgnoreCaseOrderByDateCreationDesc(
        Long userId, String keyword, Pageable pageable);

    Page<ActivityLog> findByUserIdAndResourceTypeAndResourceIdOrderByDateCreationDesc(
        Long userId, ActivityLog.ResourceType resourceType, Long resourceId, Pageable pageable);
}
