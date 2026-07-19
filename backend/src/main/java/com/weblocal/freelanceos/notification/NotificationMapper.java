package com.weblocal.freelanceos.notification;

import com.weblocal.freelanceos.notification.dto.NotificationRequestDto;
import com.weblocal.freelanceos.notification.dto.NotificationResponseDto;
import com.weblocal.freelanceos.auth.User;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public Notification toEntity(NotificationRequestDto dto, User user) {
        Notification notification = new Notification();
        applyRequestDto(notification, dto, user);
        return notification;
    }

    public void applyRequestDto(Notification notification, NotificationRequestDto dto, User user) {
        notification.setTitle(dto.title());
        notification.setMessage(dto.message());
        notification.setType(dto.type());
        notification.setUser(user);
        notification.setActionUrl(dto.actionUrl());
        notification.setRelatedResourceId(dto.relatedResourceId());
        notification.setRelatedResourceType(dto.relatedResourceType());
        notification.setPriority(dto.priority() != null ? dto.priority() : Notification.NotificationPriority.NORMAL);
        notification.setIcon(dto.icon());
    }

    public NotificationResponseDto toResponseDto(Notification notification) {
        return new NotificationResponseDto(
                notification.getId(),
                notification.getDateCreation(),
                notification.getDateModification(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getRead(),
                notification.getActionUrl(),
                notification.getRelatedResourceId(),
                notification.getRelatedResourceType(),
                notification.getPriority(),
                notification.getIcon()
        );
    }
}
