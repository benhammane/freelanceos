package com.weblocal.freelanceos.activity.dto;

import com.weblocal.freelanceos.activity.ActivityLog;

import java.time.LocalDateTime;
import java.util.Map;

public record ActivityLogResponseDto(
        Long id,
        LocalDateTime dateCreation,
        LocalDateTime dateModification,
        ActivityLog.ActivityAction action,
        ActivityLog.ResourceType resourceType,
        Long resourceId,
        String userEmail,
        String description,
        ActivityLog.ActivityCategory category,
        String icon,
        Map<String, String> metadata
) {
}
