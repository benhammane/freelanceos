package com.weblocal.freelanceos.event.entity;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "events", indexes = {
    @Index(name = "idx_event_user_id", columnList = "user_id"),
    @Index(name = "idx_event_start_time", columnList = "start_date_time"),
    @Index(name = "idx_event_resource", columnList = "related_resource_type,related_resource_id")
})
public class Event extends BaseEntity {
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "text") private String description;
    @Column(nullable = false) private LocalDateTime startDateTime;
    @Column(nullable = false) private LocalDateTime endDateTime;

    @Enumerated(EnumType.STRING) private EventColor color = EventColor.BLUE;
    private String location;
    private String meetingLink;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private EventType type;
    @Enumerated(EnumType.STRING) private EventStatus status = EventStatus.SCHEDULED;
    @Enumerated(EnumType.STRING) private EventPriority priority = EventPriority.NORMAL;

    @Column(columnDefinition = "text") private String notes;

    private String relatedResourceType;
    private Long relatedResourceId;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    private Long roomId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true) @JoinColumn(name = "event_id")
    private List<EventParticipant> participants = new ArrayList<>();
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true) @JoinColumn(name = "event_id")
    private List<EventReminder> reminders = new ArrayList<>();
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true) @JoinColumn(name = "recurrence_id")
    private EventRecurrence recurrence;

    public enum EventColor { BLUE, RED, GREEN, YELLOW, PURPLE, GRAY }
    public enum EventType { MEETING, DEADLINE, DEMO, PERSONAL, REMINDER }
    public enum EventStatus { SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED }
    public enum EventPriority { LOW, NORMAL, HIGH }
}
