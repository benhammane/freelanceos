package com.weblocal.freelanceos.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByDateCreationDesc(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndReadOrderByDateCreationDesc(Long userId, Boolean read, Pageable pageable);

    Page<Notification> findByUserIdAndTypeOrderByDateCreationDesc(
        Long userId, Notification.NotificationType type, Pageable pageable);

    Page<Notification> findByUserIdAndPriorityOrderByDateCreationDesc(
        Long userId, Notification.NotificationPriority priority, Pageable pageable);

    long countByUserIdAndRead(Long userId, Boolean read);

    void deleteByUserIdAndRead(Long userId, Boolean read);
}
