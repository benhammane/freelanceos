package com.weblocal.freelanceos.notification.dto;

import com.weblocal.freelanceos.notification.Notification;

import java.time.LocalDateTime;

public record NotificationResponseDto(
        Long id,
        LocalDateTime dateCreation,
        LocalDateTime dateModification,
        String title,
        String message,
        Notification.NotificationType type,
        Boolean read,
        String actionUrl,
        Long relatedResourceId,
        String relatedResourceType,
        Notification.NotificationPriority priority,
        String icon
) {
}
