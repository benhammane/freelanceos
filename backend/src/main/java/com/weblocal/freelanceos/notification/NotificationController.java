package com.weblocal.freelanceos.notification;

import com.weblocal.freelanceos.auth.AuthenticatedUser;
import com.weblocal.freelanceos.notification.dto.NotificationResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification center and management")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public Page<NotificationResponseDto> getUserNotifications(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationService.getUserNotifications(user.userId(), pageable);
    }

    @GetMapping("/unread")
    public Page<NotificationResponseDto> getUnreadNotifications(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationService.getUnreadNotifications(user.userId(), pageable);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(@AuthenticationPrincipal AuthenticatedUser user) {
        return notificationService.getUnreadCount(user.userId());
    }

    @GetMapping("/{id}")
    public NotificationResponseDto getNotification(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id) {
        return notificationService.getNotification(id);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponseDto markAsRead(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id) {
        return notificationService.markAsRead(id, user.userId());
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal AuthenticatedUser user) {
        notificationService.markAllAsRead(user.userId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id) {
        notificationService.deleteNotification(id, user.userId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/read/cleanup")
    public ResponseEntity<Void> deleteAllReadNotifications(@AuthenticationPrincipal AuthenticatedUser user) {
        notificationService.deleteAllReadNotifications(user.userId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter/type")
    public Page<NotificationResponseDto> getNotificationsByType(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam Notification.NotificationType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationService.getNotificationsByType(user.userId(), type, pageable);
    }

    @GetMapping("/filter/priority")
    public Page<NotificationResponseDto> getNotificationsByPriority(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam Notification.NotificationPriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationService.getNotificationsByPriority(user.userId(), priority, pageable);
    }
}
