package com.weblocal.freelanceos.event.dto;

public record EventParticipantDto(Long id, String name, String email, String rsvpStatus, Boolean isOrganizer) {}
