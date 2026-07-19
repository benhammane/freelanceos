package com.weblocal.freelanceos.event;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.event.dto.EventRequestDto;
import com.weblocal.freelanceos.event.dto.EventResponseDto;
import com.weblocal.freelanceos.event.dto.EventParticipantDto;
import com.weblocal.freelanceos.event.dto.EventReminderDto;
import com.weblocal.freelanceos.event.dto.EventRecurrenceDto;
import com.weblocal.freelanceos.event.entity.Event;
import com.weblocal.freelanceos.event.entity.EventParticipant;
import com.weblocal.freelanceos.event.entity.EventReminder;
import com.weblocal.freelanceos.event.entity.EventRecurrence;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {
    public Event toEntity(EventRequestDto dto, User user) {
        Event event = new Event();
        applyRequestDto(event, dto, user);
        return event;
    }

    public void applyRequestDto(Event event, EventRequestDto dto, User user) {
        event.setTitle(dto.title());
        event.setDescription(dto.description());
        event.setStartDateTime(dto.startDateTime());
        event.setEndDateTime(dto.endDateTime());
        event.setColor(dto.color() != null ? Event.EventColor.valueOf(dto.color()) : Event.EventColor.BLUE);
        event.setLocation(dto.location());
        event.setMeetingLink(dto.meetingLink());
        event.setType(Event.EventType.valueOf(dto.type()));
        event.setStatus(dto.status() != null ? Event.EventStatus.valueOf(dto.status()) : Event.EventStatus.SCHEDULED);
        event.setPriority(dto.priority() != null ? Event.EventPriority.valueOf(dto.priority()) : Event.EventPriority.NORMAL);
        event.setRelatedResourceType(dto.relatedResourceType());
        event.setRelatedResourceId(dto.relatedResourceId());
        event.setRoomId(dto.roomId());
        event.setNotes(dto.notes());
        event.setUser(user);
    }

    public EventResponseDto toResponseDto(Event event) {
        return new EventResponseDto(
            event.getId(), event.getDateCreation(), event.getTitle(), event.getDescription(),
            event.getStartDateTime(), event.getEndDateTime(),
            event.getColor().toString(), event.getLocation(), event.getMeetingLink(),
            event.getType().toString(), event.getStatus().toString(), event.getPriority().toString(),
            event.getRelatedResourceType(), event.getRelatedResourceId(), event.getRoomId(),
            event.getNotes(),
            event.getParticipants().stream().map(this::toParticipantDto).toList(),
            event.getReminders().stream().map(this::toReminderDto).toList(),
            event.getRecurrence() != null ? toRecurrenceDto(event.getRecurrence()) : null
        );
    }

    private EventParticipantDto toParticipantDto(EventParticipant p) {
        return new EventParticipantDto(p.getId(), p.getName(), p.getExternalEmail() != null ? p.getExternalEmail() : (p.getUser() != null ? p.getUser().getEmail() : ""), p.getRsvpStatus().toString(), p.getIsOrganizer());
    }

    private EventReminderDto toReminderDto(EventReminder r) {
        return new EventReminderDto(r.getId(), r.getReminderTime().toString(), r.getReminderType().toString(), r.getNotificationSent());
    }

    private EventRecurrenceDto toRecurrenceDto(EventRecurrence r) {
        return new EventRecurrenceDto(r.getId(), r.getRule().toString(), r.getRecurrenceEndDate() != null ? r.getRecurrenceEndDate().toString() : null, r.getOccurrenceCount());
    }
}
