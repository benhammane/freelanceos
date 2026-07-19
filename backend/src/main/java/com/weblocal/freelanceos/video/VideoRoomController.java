package com.weblocal.freelanceos.video;

import com.weblocal.freelanceos.auth.AuthenticatedUser;
import com.weblocal.freelanceos.video.entity.VideoRoom;
import com.weblocal.freelanceos.video.entity.RoomParticipant;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/rooms") @RequiredArgsConstructor @Tag(name = "Video Rooms", description = "Video conferencing rooms")
@PreAuthorize("hasRole('ADMIN')")
public class VideoRoomController {
    private final VideoRoomService roomService;

    @GetMapping
    public Page<VideoRoom> list(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(defaultValue = "0") int page) {
        return roomService.getUserRooms(user.userId(), PageRequest.of(page, 20));
    }

    @GetMapping("/{id}")
    public VideoRoom get(@PathVariable Long id) {
        return roomService.getRoom(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VideoRoom create(@AuthenticationPrincipal AuthenticatedUser user, @RequestBody VideoRoomCreateDto dto) {
        return roomService.createRoom(dto.name(), dto.description(), user.userId());
    }

    @PostMapping("/{id}/join")
    public RoomParticipant join(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id, @RequestBody JoinRoomDto dto) {
        return roomService.joinRoom(id, user.userId(), dto.displayName());
    }

    @PostMapping("/{participantId}/leave")
    public ResponseEntity<Void> leave(@PathVariable Long participantId) {
        roomService.leaveRoom(participantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/participants")
    public List<RoomParticipant> getParticipants(@PathVariable Long id) {
        return roomService.getRoomParticipants(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id) {
        roomService.deleteRoom(id, user.userId());
        return ResponseEntity.noContent().build();
    }
}

record VideoRoomCreateDto(String name, String description) {}
record JoinRoomDto(String displayName) {}
