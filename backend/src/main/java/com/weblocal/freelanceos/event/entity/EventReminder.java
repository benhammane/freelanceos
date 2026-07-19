package com.weblocal.freelanceos.event.entity;

import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "event_reminders")
public class EventReminder extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "event_id") private Event event;
    @Enumerated(EnumType.STRING) private ReminderTime reminderTime;
    @Enumerated(EnumType.STRING) private ReminderType reminderType = ReminderType.NOTIFICATION;
    @Column(nullable = false) private Boolean notificationSent = false;
    private LocalDateTime sentDateTime;

    public enum ReminderTime { AT_TIME, BEFORE_15_MIN, BEFORE_30_MIN, BEFORE_1_HOUR, BEFORE_1_DAY }
    public enum ReminderType { NOTIFICATION, EMAIL }
}
