package com.weblocal.freelanceos.video.entity;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "room_participants")
public class RoomParticipant extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "room_id") private VideoRoom room;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    private String externalEmail;
    @Column(nullable = false) private String displayName;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    @Column(nullable = false) private Boolean audioEnabled = true;
    @Column(nullable = false) private Boolean videoEnabled = true;
    @Column(nullable = false) private Boolean screenShareActive = false;
    private LocalDateTime screenShareStartedAt;
}
