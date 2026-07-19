package com.weblocal.freelanceos.notification;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user_id", columnList = "user_id"),
    @Index(name = "idx_notifications_date_creation", columnList = "date_creation DESC"),
    @Index(name = "idx_notifications_read", columnList = "read")
})
public class Notification extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String message;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Boolean read = false;

    @Column(columnDefinition = "text")
    private String actionUrl;

    private Long relatedResourceId;

    private String relatedResourceType;

    @Enumerated(EnumType.STRING)
    private NotificationPriority priority = NotificationPriority.NORMAL;

    private String icon;

    public enum NotificationType {
        INFO, SUCCESS, WARNING, ERROR
    }

    public enum NotificationPriority {
        LOW, NORMAL, HIGH
    }
}
