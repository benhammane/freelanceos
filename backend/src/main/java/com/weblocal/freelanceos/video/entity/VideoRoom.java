package com.weblocal.freelanceos.video.entity;

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
@Entity @Table(name = "video_rooms", indexes = {
    @Index(name = "idx_room_creator_id", columnList = "creator_id"),
    @Index(name = "idx_room_status", columnList = "status")
})
public class VideoRoom extends BaseEntity {
    @Column(nullable = false) private String name;
    @Column(columnDefinition = "text") private String description;
    private Long eventId;
    private Long clientId;
    private Long projectId;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "creator_id", nullable = false) private User creator;
    private String password;
    @Enumerated(EnumType.STRING) private RoomStatus status = RoomStatus.AWAITING;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Integer maxParticipants = 100;
    private Boolean recordingEnabled = false;
    private Boolean transcriptionEnabled = false;
    private String sessionRecordingPath;
    private String sessionTranscriptionPath;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true) @JoinColumn(name = "room_id")
    private List<RoomParticipant> participants = new ArrayList<>();

    public enum RoomStatus { AWAITING, ACTIVE, ENDED, ARCHIVED }
}
