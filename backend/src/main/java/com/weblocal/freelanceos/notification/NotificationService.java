package com.weblocal.freelanceos.notification;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.auth.UserRepository;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.notification.dto.NotificationRequestDto;
import com.weblocal.freelanceos.notification.dto.NotificationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;

    public Page<NotificationResponseDto> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository
                .findByUserIdOrderByDateCreationDesc(userId, pageable)
                .map(notificationMapper::toResponseDto);
    }

    public Page<NotificationResponseDto> getUnreadNotifications(Long userId, Pageable pageable) {
        return notificationRepository
                .findByUserIdAndReadOrderByDateCreationDesc(userId, false, pageable)
                .map(notificationMapper::toResponseDto);
    }

    public Page<NotificationResponseDto> getReadNotifications(Long userId, Pageable pageable) {
        return notificationRepository
                .findByUserIdAndReadOrderByDateCreationDesc(userId, true, pageable)
                .map(notificationMapper::toResponseDto);
    }

    public Page<NotificationResponseDto> getNotificationsByType(
            Long userId,
            Notification.NotificationType type,
            Pageable pageable) {
        return notificationRepository
                .findByUserIdAndTypeOrderByDateCreationDesc(userId, type, pageable)
                .map(notificationMapper::toResponseDto);
    }

    public Page<NotificationResponseDto> getNotificationsByPriority(
            Long userId,
            Notification.NotificationPriority priority,
            Pageable pageable) {
        return notificationRepository
                .findByUserIdAndPriorityOrderByDateCreationDesc(userId, priority, pageable)
                .map(notificationMapper::toResponseDto);
    }

    public NotificationResponseDto getNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        return notificationMapper.toResponseDto(notification);
    }

    public NotificationResponseDto sendNotification(
            Long userId,
            String title,
            String message,
            Notification.NotificationType type,
            String actionUrl,
            Long relatedResourceId,
            String relatedResourceType,
            Notification.NotificationPriority priority) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        NotificationRequestDto dto = new NotificationRequestDto(
                title, message, type, actionUrl, relatedResourceId, relatedResourceType, priority, null);

        Notification notification = notificationMapper.toEntity(dto, user);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toResponseDto(saved);
    }

    public NotificationResponseDto markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found: " + notificationId);
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return notificationMapper.toResponseDto(updated);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.findByUserIdAndReadOrderByDateCreationDesc(userId, false, Pageable.unpaged())
                .forEach(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
    }

    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found: " + notificationId);
        }

        notificationRepository.delete(notification);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    public void deleteAllReadNotifications(Long userId) {
        notificationRepository.deleteByUserIdAndRead(userId, true);
    }
}
