package com.weblocal.freelanceos.activity;

import com.weblocal.freelanceos.activity.dto.ActivityLogRequestDto;
import com.weblocal.freelanceos.activity.dto.ActivityLogResponseDto;
import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.auth.UserRepository;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogMapper activityLogMapper;
    private final UserRepository userRepository;

    public Page<ActivityLogResponseDto> getTimeline(Long userId, Pageable pageable) {
        return activityLogRepository
                .findByUserIdOrderByDateCreationDesc(userId, pageable)
                .map(activityLogMapper::toResponseDto);
    }

    public Page<ActivityLogResponseDto> getTimelineByResourceType(
            Long userId,
            ActivityLog.ResourceType resourceType,
            Pageable pageable) {
        return activityLogRepository
                .findByUserIdAndResourceTypeOrderByDateCreationDesc(userId, resourceType, pageable)
                .map(activityLogMapper::toResponseDto);
    }

    public Page<ActivityLogResponseDto> getTimelineByCategory(
            Long userId,
            ActivityLog.ActivityCategory category,
            Pageable pageable) {
        return activityLogRepository
                .findByUserIdAndCategoryOrderByDateCreationDesc(userId, category, pageable)
                .map(activityLogMapper::toResponseDto);
    }

    public Page<ActivityLogResponseDto> getTimelineByAction(
            Long userId,
            ActivityLog.ActivityAction action,
            Pageable pageable) {
        return activityLogRepository
                .findByUserIdAndActionOrderByDateCreationDesc(userId, action, pageable)
                .map(activityLogMapper::toResponseDto);
    }

    public Page<ActivityLogResponseDto> searchActivities(
            Long userId,
            String keyword,
            Pageable pageable) {
        return activityLogRepository
                .findByUserIdAndDescriptionContainsIgnoreCaseOrderByDateCreationDesc(userId, keyword, pageable)
                .map(activityLogMapper::toResponseDto);
    }

    public List<ActivityLogResponseDto> getTimelineByDateRange(
            Long userId,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return activityLogRepository
                .findByUserIdAndDateCreationBetweenOrderByDateCreationDesc(userId, startDate, endDate)
                .stream()
                .map(activityLogMapper::toResponseDto)
                .toList();
    }

    public ActivityLogResponseDto getActivityLog(Long id) {
        ActivityLog log = activityLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity log not found: " + id));
        return activityLogMapper.toResponseDto(log);
    }

    public ActivityLogResponseDto logActivity(
            Long userId,
            ActivityLog.ActivityAction action,
            ActivityLog.ResourceType resourceType,
            Long resourceId,
            String description,
            ActivityLog.ActivityCategory category,
            String icon) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        ActivityLogRequestDto dto = new ActivityLogRequestDto(
                action, resourceType, resourceId, description, category, icon, null);

        ActivityLog log = activityLogMapper.toEntity(dto, user);
        ActivityLog saved = activityLogRepository.save(log);
        return activityLogMapper.toResponseDto(saved);
    }

    public void deleteOldActivityLogs(LocalDateTime beforeDate) {
        activityLogRepository.deleteAll(
                activityLogRepository.findAll().stream()
                        .filter(log -> log.getDateCreation().isBefore(beforeDate))
                        .toList()
        );
    }
}
