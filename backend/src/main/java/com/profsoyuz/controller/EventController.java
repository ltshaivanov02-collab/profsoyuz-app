package com.profsoyuz.controller;

import com.profsoyuz.dto.EventParticipantDto;
import com.profsoyuz.dto.EventResponse;
import com.profsoyuz.model.Event;
import com.profsoyuz.model.EventRegistration;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.EventRegistrationRepository;
import com.profsoyuz.service.BookmarkService;
import com.profsoyuz.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final BookmarkService bookmarkService;

    public EventController(EventService eventService,
                           EventRegistrationRepository eventRegistrationRepository,
                           BookmarkService bookmarkService) {
        this.eventService = eventService;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.bookmarkService = bookmarkService;
    }

    // ============================================
    // БАЗОВЫЕ CRUD
    // ============================================

    @GetMapping
    public List<EventResponse> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/upcoming")
    public List<EventResponse> getUpcomingEvents() {
        return eventService.getUpcomingEvents();
    }

    @GetMapping("/paged")
    public Page<EventResponse> getEventsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return eventService.getEventsPaginated(page, size);
    }

    @GetMapping("/{id}")
    public EventResponse getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return eventService.convertToResponse(event);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public EventResponse createEvent(@RequestBody CreateEventRequest request,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated. Please login again.");
        }
        User createdBy = (User) userDetails;
        Event event = eventService.createEvent(
                request.getTitle(),
                request.getDescription(),
                request.getDateTime(),
                request.getLocation(),
                request.getMaxParticipants(),
                createdBy
        );
        return eventService.convertToResponse(event);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public EventResponse updateEvent(@PathVariable Long id,
                                     @RequestBody CreateEventRequest request) {
        Event event = eventService.updateEvent(
                id,
                request.getTitle(),
                request.getDescription(),
                request.getDateTime(),
                request.getLocation(),
                request.getMaxParticipants()
        );
        return eventService.convertToResponse(event);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }

    // ============================================
    // ЗАПИСЬ НА СОБЫТИЕ
    // ============================================

    @PostMapping("/{id}/register")
    @Transactional
    public String registerForEvent(@PathVariable Long id,
                                   @RequestParam(defaultValue = "1") int quantity,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        if (!eventService.hasAvailablePlaces(id)) {
            return "No available places";
        }

        if (eventRegistrationRepository.existsByUserIdAndEventId(user.getId(), id)) {
            return "Already registered";
        }

        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(eventService.getEventById(id));
        registration.setQuantity(quantity);
        registration.setRegisteredAt(LocalDateTime.now());

        eventRegistrationRepository.save(registration);
        return "Registration successful";
    }

    @DeleteMapping("/{id}/register")
    @Transactional
    public String cancelRegistration(@PathVariable Long id,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        eventRegistrationRepository.deleteByUserIdAndEventId(user.getId(), id);
        return "Registration cancelled";
    }

    @GetMapping("/{id}/registered")
    public boolean isRegistered(@PathVariable Long id,
                                @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return eventRegistrationRepository.existsByUserIdAndEventId(user.getId(), id);
    }

    // ============================================
    // КАЛЕНДАРЬ СОБЫТИЙ (НОВОЕ!)
    // ============================================

    @GetMapping("/calendar")
    public List<EventResponse> getUserCalendar(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return eventService.getUserEventsForMonth(user.getId(), year, month);
    }

    // ============================================
    // ЗАКЛАДКИ
    // ============================================

    @PostMapping("/{id}/bookmark")
    public String addBookmark(@PathVariable Long id,
                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        bookmarkService.addEventBookmark(user.getId(), id);
        return "Event bookmarked successfully";
    }

    @DeleteMapping("/{id}/bookmark")
    public String removeBookmark(@PathVariable Long id,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        bookmarkService.removeEventBookmark(user.getId(), id);
        return "Event unbookmarked successfully";
    }

    @GetMapping("/{id}/bookmarked")
    public boolean isBookmarked(@PathVariable Long id,
                                @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return bookmarkService.isEventBookmarked(user.getId(), id);
    }

    // ============================================
    // ВНУТРЕННИЙ DTO
    // ============================================

    public static class CreateEventRequest {
        private String title;
        private String description;
        private LocalDateTime dateTime;
        private String location;
        private Integer maxParticipants;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getDateTime() { return dateTime; }
        public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public Integer getMaxParticipants() { return maxParticipants; }
        public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    }

    @GetMapping("/{id}/participants")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public List<EventParticipantDto> getEventParticipants(@PathVariable Long id) {
        return eventService.getEventParticipants(id);
    }
}
