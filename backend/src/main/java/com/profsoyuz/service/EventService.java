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
import com.profsoyuz.repository.EventCommentRepository;
import com.profsoyuz.repository.EventReactionRepository;
import com.profsoyuz.model.ReactionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final NotificationService notificationService;
    private final EventCommentRepository eventCommentRepository;
    private final EventReactionRepository eventReactionRepository;

    public EventService(EventRepository eventRepository,
                        EventRegistrationRepository eventRegistrationRepository,
                        NotificationService notificationService,
                        EventCommentRepository eventCommentRepository,
                        EventReactionRepository eventReactionRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.notificationService = notificationService;
        this.eventCommentRepository = eventCommentRepository;
        this.eventReactionRepository = eventReactionRepository;
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
                             String location, Integer maxParticipants,
                             String imageUrl,
                             User createdBy) {
        if (createdBy == null) {
            throw new RuntimeException("createdBy cannot be null");
        }

        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setDateTime(dateTime);
        event.setLocation(location);
        event.setMaxParticipants(maxParticipants);
        event.setImageUrl(imageUrl);
        event.setCreatedBy(createdBy);
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());

        Event saved = eventRepository.save(event);

        // ✅ УВЕДОМЛЕНИЕ ВСЕМ ПОЛЬЗОВАТЕЛЯМ
        notificationService.createNotificationForAllUsers(
                "event",
                "Новое событие",
                title + " — " + dateTime.toLocalDate(),
                "events.html"
        );

        return saved;
    }


    @Transactional
    public Event updateEvent(Long id, String title, String description, LocalDateTime dateTime,
                             String location, Integer maxParticipants,
                             String imageUrl) {
        Event event = getEventById(id);
        event.setTitle(title);
        event.setDescription(description);
        event.setDateTime(dateTime);
        event.setLocation(location);
        event.setMaxParticipants(maxParticipants);

        if (imageUrl != null) {
            event.setImageUrl(imageUrl);
        }
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
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
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
        response.setImageUrl(event.getImageUrl());

        // ✅ СЧЁТЧИК КОММЕНТАРИЕВ
        long commentsCount = eventCommentRepository.countByEventId(event.getId());
        response.setCommentsCount((int) commentsCount);

        // ✅ СЧЁТЧИК СЕРДЕЧЕК
        long hearts = eventReactionRepository.countByEventIdAndReactionType(
                event.getId(), ReactionType.HEART);
        response.setHeartsCount(hearts);
        response.setTotalReactionsCount(hearts);

        return response;
    }

    public List<EventParticipantDto> getEventParticipants(Long eventId) {
        return eventRegistrationRepository.getEventParticipants(eventId);
    }

    public List<EventResponse> getRegisteredEvents(Long userId) {
        return eventRegistrationRepository.findByUserId(userId)
                .stream()
                .filter(reg -> reg.getEvent() != null)
                .map(reg -> convertToResponse(reg.getEvent()))
                .collect(Collectors.toList());
    }
}

