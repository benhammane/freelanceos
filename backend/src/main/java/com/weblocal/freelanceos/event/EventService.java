package com.weblocal.freelanceos.event;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.auth.UserRepository;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.event.dto.EventRequestDto;
import com.weblocal.freelanceos.event.dto.EventResponseDto;
import com.weblocal.freelanceos.event.entity.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor @Transactional
public class EventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final UserRepository userRepository;

    public Page<EventResponseDto> getUserEvents(Long userId, Pageable pageable) {
        return eventRepository.findByUserIdOrderByStartDateTimeAsc(userId, pageable).map(eventMapper::toResponseDto);
    }

    public List<EventResponseDto> getEventsByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByUserIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(userId, start, end).stream().map(eventMapper::toResponseDto).toList();
    }

    public List<EventResponseDto> getEventsForResource(String resourceType, Long resourceId) {
        return eventRepository.findByRelatedResourceTypeAndRelatedResourceIdOrderByStartDateTimeAsc(resourceType, resourceId).stream().map(eventMapper::toResponseDto).toList();
    }

    public EventResponseDto getEvent(Long id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
        return eventMapper.toResponseDto(event);
    }

    public EventResponseDto createEvent(EventRequestDto dto, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventMapper.toEntity(dto, user);
        Event saved = eventRepository.save(event);
        return eventMapper.toResponseDto(saved);
    }

    public EventResponseDto updateEvent(Long id, EventRequestDto dto, Long userId) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!event.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Event not found");
        User user = event.getUser();
        eventMapper.applyRequestDto(event, dto, user);
        Event saved = eventRepository.save(event);
        return eventMapper.toResponseDto(saved);
    }

    public EventResponseDto moveEvent(Long id, LocalDateTime newStart, LocalDateTime newEnd, Long userId) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!event.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Event not found");
        event.setStartDateTime(newStart);
        event.setEndDateTime(newEnd);
        Event saved = eventRepository.save(event);
        return eventMapper.toResponseDto(saved);
    }

    public void deleteEvent(Long id, Long userId) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (!event.getUser().getId().equals(userId)) throw new ResourceNotFoundException("Event not found");
        eventRepository.delete(event);
    }
}
