package com.weblocal.freelanceos.activity;

import com.weblocal.freelanceos.activity.dto.ActivityLogResponseDto;
import com.weblocal.freelanceos.auth.AuthenticatedUser;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
@Tag(name = "Activity Logs", description = "Activity timeline and audit logs")
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public Page<ActivityLogResponseDto> getTimeline(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogService.getTimeline(user.userId(), pageable);
    }

    @GetMapping("/{id}")
    public ActivityLogResponseDto getActivityLog(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id) {
        return activityLogService.getActivityLog(id);
    }

    @GetMapping("/filter/resource-type")
    public Page<ActivityLogResponseDto> getTimelineByResourceType(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam ActivityLog.ResourceType resourceType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogService.getTimelineByResourceType(user.userId(), resourceType, pageable);
    }

    @GetMapping("/filter/category")
    public Page<ActivityLogResponseDto> getTimelineByCategory(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam ActivityLog.ActivityCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogService.getTimelineByCategory(user.userId(), category, pageable);
    }

    @GetMapping("/filter/action")
    public Page<ActivityLogResponseDto> getTimelineByAction(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam ActivityLog.ActivityAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogService.getTimelineByAction(user.userId(), action, pageable);
    }

    @GetMapping("/search")
    public Page<ActivityLogResponseDto> searchActivities(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return activityLogService.searchActivities(user.userId(), keyword, pageable);
    }

    @GetMapping("/date-range")
    public List<ActivityLogResponseDto> getTimelineByDateRange(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        return activityLogService.getTimelineByDateRange(user.userId(), startDate, endDate);
    }
}
