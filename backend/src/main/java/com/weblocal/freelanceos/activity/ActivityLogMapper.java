package com.weblocal.freelanceos.activity;

import com.weblocal.freelanceos.activity.dto.ActivityLogRequestDto;
import com.weblocal.freelanceos.activity.dto.ActivityLogResponseDto;
import com.weblocal.freelanceos.auth.User;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ActivityLogMapper {

    public ActivityLog toEntity(ActivityLogRequestDto dto, User user) {
        ActivityLog log = new ActivityLog();
        applyRequestDto(log, dto, user);
        return log;
    }

    public void applyRequestDto(ActivityLog log, ActivityLogRequestDto dto, User user) {
        log.setAction(dto.action());
        log.setResourceType(dto.resourceType());
        log.setResourceId(dto.resourceId());
        log.setUser(user);
        log.setDescription(dto.description());
        log.setCategory(dto.category());
        log.setIcon(dto.icon());
        if (dto.metadata() != null) {
            log.setMetadata(new HashMap<>(dto.metadata()));
        }
    }

    public ActivityLogResponseDto toResponseDto(ActivityLog log) {
        return new ActivityLogResponseDto(
                log.getId(),
                log.getDateCreation(),
                log.getDateModification(),
                log.getAction(),
                log.getResourceType(),
                log.getResourceId(),
                log.getUser().getEmail(),
                log.getDescription(),
                log.getCategory(),
                log.getIcon(),
                log.getMetadata() != null ? new HashMap<>(log.getMetadata()) : new HashMap<>()
        );
    }
}
