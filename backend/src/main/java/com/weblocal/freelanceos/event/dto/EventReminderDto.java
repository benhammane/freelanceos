package com.weblocal.freelanceos.event.dto;

public record EventReminderDto(Long id, String reminderTime, String reminderType, Boolean notificationSent) {}
