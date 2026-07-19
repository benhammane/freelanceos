package com.weblocal.freelanceos.notification.dto;

import com.weblocal.freelanceos.notification.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequestDto(
        @NotBlank String title,
        String message,
        @NotNull Notification.NotificationType type,
        String actionUrl,
        Long relatedResourceId,
        String relatedResourceType,
        Notification.NotificationPriority priority,
        String icon
) {
}
