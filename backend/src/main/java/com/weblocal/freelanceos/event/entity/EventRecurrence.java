package com.weblocal.freelanceos.event.entity;

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
@Entity @Table(name = "event_recurrences")
public class EventRecurrence extends BaseEntity {
    @Enumerated(EnumType.STRING) private RecurrenceRule rule;
    private LocalDateTime recurrenceEndDate;
    private Integer occurrenceCount;

    @ElementCollection @CollectionTable(name = "event_recurrence_exceptions", joinColumns = @JoinColumn(name = "recurrence_id"))
    @Column(name = "exception_date") private List<String> exceptions = new ArrayList<>();

    public enum RecurrenceRule { DAILY, WEEKLY, MONTHLY, YEARLY }
}
