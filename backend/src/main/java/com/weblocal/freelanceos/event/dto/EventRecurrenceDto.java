package com.weblocal.freelanceos.event.dto;

public record EventRecurrenceDto(Long id, String rule, String recurrenceEndDate, Integer occurrenceCount) {}
