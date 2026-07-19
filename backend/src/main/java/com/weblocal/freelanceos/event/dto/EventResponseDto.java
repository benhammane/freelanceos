package com.weblocal.freelanceos.event.dto;

import com.weblocal.freelanceos.event.entity.Event;
import java.time.LocalDateTime;
import java.util.List;

public record EventResponseDto(
    Long id, LocalDateTime dateCreation, String title, String description,
    LocalDateTime startDateTime, LocalDateTime endDateTime,
    String color, String location, String meetingLink, String type, String status, String priority,
    String relatedResourceType, Long relatedResourceId, Long roomId,
    String notes, List<EventParticipantDto> participants, List<EventReminderDto> reminders,
    EventRecurrenceDto recurrence
) {}
