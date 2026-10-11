package com.profsoyuz.controller;

import com.profsoyuz.dto.EventParticipantDto;
import com.profsoyuz.dto.EventResponse;
import com.profsoyuz.dto.CommentDto;
import com.profsoyuz.model.Event;
import com.profsoyuz.model.EventComment;
import com.profsoyuz.model.EventRegistration;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.EventCommentRepository;
import com.profsoyuz.repository.EventRegistrationRepository;
import com.profsoyuz.service.BookmarkService;
import com.profsoyuz.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.profsoyuz.dto.EventRegistrationDto;
import java.util.stream.Collectors;
import com.profsoyuz.service.NotificationService;
import com.profsoyuz.repository.EventReactionRepository;
import com.profsoyuz.model.EventReaction;
import com.profsoyuz.model.ReactionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final BookmarkService bookmarkService;
    private final NotificationService notificationService;
    private final EventCommentRepository eventCommentRepository;
    private final EventReactionRepository eventReactionRepository;

    public EventController(EventService eventService,
                           EventRegistrationRepository eventRegistrationRepository,
                           BookmarkService bookmarkService,
                           NotificationService notificationService,
                           EventCommentRepository eventCommentRepository,
                           EventReactionRepository eventReactionRepository) {
        this.eventService = eventService;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.bookmarkService = bookmarkService;
        this.notificationService = notificationService;
        this.eventCommentRepository = eventCommentRepository;
        this.eventReactionRepository = eventReactionRepository;
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

    @GetMapping("/registered")
    public List<EventResponse> getRegisteredEvents(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return eventService.getRegisteredEvents(user.getId());
    }

    @GetMapping("/calendar")
    public List<EventResponse> getUserCalendar(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return eventService.getUserEventsForMonth(user.getId(), year, month);
    }

    @GetMapping("/{id:\\d+}")
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
                request.getImageUrl(),
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
                request.getMaxParticipants(),
                request.getImageUrl()
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

    @PostMapping("/{id:\\d+}/register")
    @Transactional
    public String registerForEvent(@PathVariable Long id,
                                   @RequestBody RegisterRequest request,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        if (!eventService.hasAvailablePlaces(id)) {
            return "No available places";
        }

        if (eventRegistrationRepository.existsByUserIdAndEventId(user.getId(), id)) {
            return "Already registered";
        }

        Event event = eventService.getEventById(id);

        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setMembersCount(request.getMembersCount() != null ? request.getMembersCount() : 1);
        registration.setRelativesCount(request.getRelativesCount() != null ? request.getRelativesCount() : 0);
        registration.setComment(request.getComment());
        registration.setQuantity(registration.getMembersCount() + registration.getRelativesCount());
        registration.setRegisteredAt(LocalDateTime.now());

        eventRegistrationRepository.save(registration);

        notificationService.createNotification(
                user.getId(),
                "event",
                "Запись на событие",
                "Вы записались на \"" + event.getTitle() + "\"",
                "profile.html"
        );

        return "Registration successful";
    }

    @GetMapping("/registrations")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public List<EventRegistrationDto> getAllRegistrations() {
        return eventRegistrationRepository.findAll()
                .stream()
                .map(reg -> {
                    EventRegistrationDto dto = new EventRegistrationDto();
                    dto.setId(reg.getId());
                    dto.setEventId(reg.getEvent() != null ? reg.getEvent().getId() : null);
                    dto.setEventTitle(reg.getEvent() != null ? reg.getEvent().getTitle() : null);
                    dto.setEventDateTime(reg.getEvent() != null ? reg.getEvent().getDateTime() : null);
                    dto.setEventLocation(reg.getEvent() != null ? reg.getEvent().getLocation() : null);
                    dto.setUserId(reg.getUser() != null ? reg.getUser().getId() : null);
                    dto.setUserName(reg.getUser() != null ? reg.getUser().getFullName() : null);
                    dto.setUserEmail(reg.getUser() != null ? reg.getUser().getEmail() : null);
                    dto.setMembersCount(reg.getMembersCount());
                    dto.setRelativesCount(reg.getRelativesCount());
                    dto.setQuantity(reg.getQuantity());
                    dto.setComment(reg.getComment());
                    dto.setRegisteredAt(reg.getRegisteredAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // DTO для запроса
    public static class RegisterRequest {
        private Integer membersCount;
        private Integer relativesCount;
        private String comment;

        public Integer getMembersCount() { return membersCount; }
        public void setMembersCount(Integer membersCount) { this.membersCount = membersCount; }

        public Integer getRelativesCount() { return relativesCount; }
        public void setRelativesCount(Integer relativesCount) { this.relativesCount = relativesCount; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
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

    @GetMapping("/{id}/participants")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public List<EventParticipantDto> getEventParticipants(@PathVariable Long id) {
        return eventService.getEventParticipants(id);
    }

    // ============================================
    // КОММЕНТАРИИ К СОБЫТИЮ
    // ============================================

    @GetMapping("/{id:\\d+}/comments")
    public List<CommentDto> getComments(@PathVariable Long id) {
        return eventCommentRepository.findByEventIdOrderByCreatedAtDesc(id)
                .stream()
                .map(c -> {
                    CommentDto dto = new CommentDto();
                    dto.setId(c.getId());
                    dto.setText(c.getText());
                    dto.setUserName(c.getUser() != null ? c.getUser().getFullName() : "Неизвестно");
                    dto.setCreatedAt(c.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @PostMapping("/{id:\\d+}/comments")
    public CommentDto addComment(@PathVariable Long id,
                                 @RequestBody Map<String, String> request,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Event event = eventService.getEventById(id);

        EventComment comment = new EventComment();
        comment.setEvent(event);
        comment.setUser(user);
        comment.setText(request.get("text"));
        comment.setCreatedAt(LocalDateTime.now());

        EventComment saved = eventCommentRepository.save(comment);

        CommentDto dto = new CommentDto();
        dto.setId(saved.getId());
        dto.setText(saved.getText());
        dto.setUserName(user.getFullName());
        dto.setCreatedAt(saved.getCreatedAt());
        return dto;
    }

    // ============================================
// РЕАКЦИИ НА СОБЫТИЯ
// ============================================

    @PostMapping("/{id:\\d+}/reactions")
    public void addReaction(@PathVariable Long id,
                            @RequestParam ReactionType type,
                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        eventReactionRepository.findByUserIdAndEventId(user.getId(), id)
                .ifPresentOrElse(
                        reaction -> {
                            reaction.setReactionType(type);
                            eventReactionRepository.save(reaction);
                        },
                        () -> {
                            EventReaction reaction = new EventReaction();
                            reaction.setUser(user);
                            reaction.setEvent(eventService.getEventById(id));
                            reaction.setReactionType(type);
                            eventReactionRepository.save(reaction);
                        }
                );
    }

    @DeleteMapping("/{id:\\d+}/reactions")
    @Transactional
    public void removeReaction(@PathVariable Long id,
                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        eventReactionRepository.deleteByUserIdAndEventId(user.getId(), id);
    }

    @GetMapping("/{id:\\d+}/reactions/my")
    public boolean hasReaction(@PathVariable Long id,
                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return eventReactionRepository.findByUserIdAndEventId(user.getId(), id).isPresent();
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
        private String imageUrl;

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

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}