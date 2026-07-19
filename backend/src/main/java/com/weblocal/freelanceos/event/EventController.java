package com.weblocal.freelanceos.event;

import com.weblocal.freelanceos.auth.AuthenticatedUser;
import com.weblocal.freelanceos.event.dto.EventRequestDto;
import com.weblocal.freelanceos.event.dto.EventResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController @RequestMapping("/api/events") @RequiredArgsConstructor @Tag(name = "Events", description = "Calendar events management")
@PreAuthorize("hasRole('ADMIN')")
public class EventController {
    private final EventService eventService;

    @GetMapping
    public Page<EventResponseDto> list(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return eventService.getUserEvents(user.userId(), PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public EventResponseDto get(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponseDto create(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody EventRequestDto dto) {
        return eventService.createEvent(dto, user.userId());
    }

    @PutMapping("/{id}")
    public EventResponseDto update(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id, @Valid @RequestBody EventRequestDto dto) {
        return eventService.updateEvent(id, dto, user.userId());
    }

    @PatchMapping("/{id}/move")
    public EventResponseDto move(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id, @RequestBody EventMoveDto dto) {
        return eventService.moveEvent(id, dto.startDateTime(), dto.endDateTime(), user.userId());
    }

    @GetMapping("/date-range")
    public List<EventResponseDto> byDateRange(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam LocalDateTime start, @RequestParam LocalDateTime end) {
        return eventService.getEventsByDateRange(user.userId(), start, end);
    }

    @GetMapping("/resource/{resourceType}/{resourceId}")
    public List<EventResponseDto> byResource(@PathVariable String resourceType, @PathVariable Long resourceId) {
        return eventService.getEventsForResource(resourceType, resourceId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id) {
        eventService.deleteEvent(id, user.userId());
        return ResponseEntity.noContent().build();
    }
}

record EventMoveDto(LocalDateTime startDateTime, LocalDateTime endDateTime) {}
