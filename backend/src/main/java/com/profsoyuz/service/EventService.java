package com.profsoyuz.service;

import com.profsoyuz.dto.EventParticipantDto;
import com.profsoyuz.dto.EventResponse;
import com.profsoyuz.model.Event;
import com.profsoyuz.model.EventRegistration;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.EventRegistrationRepository;
import com.profsoyuz.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    public EventService(EventRepository eventRepository,
                        EventRegistrationRepository eventRegistrationRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByDateTimeAsc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getUpcomingEvents() {
        return eventRepository.findByDateTimeAfterOrderByDateTimeAsc(LocalDateTime.now())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Page<EventResponse> getEventsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "dateTime"));
        return eventRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    @Transactional
    public Event createEvent(String title, String description, LocalDateTime dateTime,
                             String location, Integer maxParticipants, User createdBy) {
        if (createdBy == null) {
            throw new RuntimeException("createdBy cannot be null");
        }

        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setDateTime(dateTime);
        event.setLocation(location);
        event.setMaxParticipants(maxParticipants);
        event.setCreatedBy(createdBy);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());

        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long id, String title, String description, LocalDateTime dateTime,
                             String location, Integer maxParticipants) {
        Event event = getEventById(id);
        event.setTitle(title);
        event.setDescription(description);
        event.setDateTime(dateTime);
        event.setLocation(location);
        event.setMaxParticipants(maxParticipants);
        event.setUpdatedAt(LocalDateTime.now());

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public boolean hasAvailablePlaces(Long eventId) {
        Event event = getEventById(eventId);
        Integer booked = eventRegistrationRepository.sumQuantityByEventId(eventId);
        int bookedPlaces = (booked != null) ? booked : 0;
        return bookedPlaces < event.getMaxParticipants();
    }

    public List<EventResponse> getUserEventsForMonth(Long userId, int year, int month) {
        // Начало месяца
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);

        // Конец месяца
        int daysInMonth = start.getMonth().length(start.toLocalDate().isLeapYear());
        LocalDateTime end = start.withDayOfMonth(daysInMonth)
                .withHour(23).withMinute(59).withSecond(59);

        return eventRegistrationRepository.findUserEventsBetween(userId, start, end)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }


    public EventResponse convertToResponse(Event event) {
        Integer booked = eventRegistrationRepository.sumQuantityByEventId(event.getId());
        int registeredCount = (booked != null) ? booked : 0;
        int remainingPlaces = event.getMaxParticipants() - registeredCount;

        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setDateTime(event.getDateTime());
        response.setLocation(event.getLocation());
        response.setMaxParticipants(event.getMaxParticipants());
        response.setRegisteredCount(registeredCount);
        response.setRemainingPlaces(Math.max(remainingPlaces, 0));
        response.setFullyBooked(remainingPlaces <= 0);
        response.setCreatedByName(event.getCreatedBy() != null ? event.getCreatedBy().getFullName() : "Unknown");
        response.setCreatedAt(event.getCreatedAt());

        return response;
    }

    public List<EventParticipantDto> getEventParticipants(Long eventId) {
        return eventRegistrationRepository.getEventParticipants(eventId);
    }
}

