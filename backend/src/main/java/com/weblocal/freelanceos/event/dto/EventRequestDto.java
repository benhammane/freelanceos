package com.weblocal.freelanceos.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record EventRequestDto(
    @NotBlank String title,
    String description,
    @NotNull LocalDateTime startDateTime,
    @NotNull LocalDateTime endDateTime,
    String color,
    String location,
    String meetingLink,
    @NotNull String type,
    String status,
    String priority,
    String relatedResourceType,
    Long relatedResourceId,
    Long roomId,
    String notes
) {}
