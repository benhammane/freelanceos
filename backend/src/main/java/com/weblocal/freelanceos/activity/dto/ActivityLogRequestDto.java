package com.weblocal.freelanceos.activity.dto;

import com.weblocal.freelanceos.activity.ActivityLog;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record ActivityLogRequestDto(
        @NotNull ActivityLog.ActivityAction action,
        @NotNull ActivityLog.ResourceType resourceType,
        @NotNull Long resourceId,
        String description,
        ActivityLog.ActivityCategory category,
        String icon,
        Map<String, String> metadata
) {
}
