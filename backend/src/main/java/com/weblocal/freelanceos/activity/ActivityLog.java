package com.weblocal.freelanceos.activity;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_activity_logs_user_id", columnList = "user_id"),
    @Index(name = "idx_activity_logs_date_creation", columnList = "date_creation DESC"),
    @Index(name = "idx_activity_logs_resource_type", columnList = "resource_type")
})
public class ActivityLog extends BaseEntity {

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ActivityAction action;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;

    @Column(nullable = false)
    private Long resourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    private ActivityCategory category;

    private String icon;

    @ElementCollection
    @CollectionTable(name = "activity_log_metadata", joinColumns = @JoinColumn(name = "activity_log_id"))
    @MapKeyColumn(name = "meta_key")
    @Column(name = "meta_value", columnDefinition = "text")
    private Map<String, String> metadata = new HashMap<>();

    public enum ActivityAction {
        CREATE, UPDATE, DELETE, VIEW, DOWNLOAD, EXPORT
    }

    public enum ResourceType {
        PROJECT, TASK, INVOICE, NOTE, CLIENT, MEETING, ROOM, USER
    }

    public enum ActivityCategory {
        PROJECTS, INVOICES, TEAMS, SYSTEM, CALENDAR, VIDEO
    }
}
