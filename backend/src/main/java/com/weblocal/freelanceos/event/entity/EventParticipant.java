package com.weblocal.freelanceos.event.entity;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "event_participants")
public class EventParticipant extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "event_id") private Event event;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    private String externalEmail;
    @Column(nullable = false) private String name;
    @Enumerated(EnumType.STRING) private RsvpStatus rsvpStatus = RsvpStatus.PENDING;
    private LocalDateTime rsvpDate;
    @Column(nullable = false) private Boolean isOrganizer = false;

    public enum RsvpStatus { PENDING, ACCEPTED, DECLINED, TENTATIVE }
}
