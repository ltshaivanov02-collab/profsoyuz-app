package com.profsoyuz.service;

import com.profsoyuz.dto.BookmarkDto;
import com.profsoyuz.model.Bookmark;
import com.profsoyuz.model.Event;
import com.profsoyuz.model.News;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.BookmarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final NewsService newsService;
    private final EventService eventService;

    public BookmarkService(BookmarkRepository bookmarkRepository,
                           NewsService newsService,
                           EventService eventService) {
        this.bookmarkRepository = bookmarkRepository;
        this.newsService = newsService;
        this.eventService = eventService;
    }

    // ============================================
    // ЗАКЛАДКИ НА НОВОСТИ
    // ============================================

    @Transactional
    public Bookmark addNewsBookmark(Long userId, Long newsId) {
        // Проверяем, существует ли новость
        News news = newsService.getNewsById(newsId);

        // Проверяем, не добавлена ли уже закладка
        if (bookmarkRepository.existsByUserIdAndNewsId(userId, newsId)) {
            throw new RuntimeException("News already bookmarked");
        }

        User user = new User();
        user.setId(userId);

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setNews(news);
        bookmark.setCreatedAt(LocalDateTime.now());

        return bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeNewsBookmark(Long userId, Long newsId) {
        if (!bookmarkRepository.existsByUserIdAndNewsId(userId, newsId)) {
            throw new RuntimeException("Bookmark not found");
        }
        bookmarkRepository.deleteByUserIdAndNewsId(userId, newsId);
    }

    public boolean isNewsBookmarked(Long userId, Long newsId) {
        return bookmarkRepository.existsByUserIdAndNewsId(userId, newsId);
    }

    // ============================================
    // ЗАКЛАДКИ НА СОБЫТИЯ
    // ============================================

    @Transactional
    public Bookmark addEventBookmark(Long userId, Long eventId) {
        Event event = eventService.getEventById(eventId);

        if (bookmarkRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Event already bookmarked");
        }

        User user = new User();
        user.setId(userId);

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setEvent(event);
        bookmark.setCreatedAt(LocalDateTime.now());

        return bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeEventBookmark(Long userId, Long eventId) {
        if (!bookmarkRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Bookmark not found");
        }
        bookmarkRepository.deleteByUserIdAndEventId(userId, eventId);
    }

    public boolean isEventBookmarked(Long userId, Long eventId) {
        return bookmarkRepository.existsByUserIdAndEventId(userId, eventId);
    }

    // ============================================
    // ПОЛУЧЕНИЕ ЗАКЛАДОК ПОЛЬЗОВАТЕЛЯ
    // ============================================

    public List<Bookmark> getUserBookmarks(Long userId) {
        return bookmarkRepository.findByUserId(userId);
    }

    public List<BookmarkDto> getUserBookmarksDto(Long userId) {
        return bookmarkRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ============================================
    // ПРЕОБРАЗОВАНИЕ ENTITY → DTO
    // ============================================

    private BookmarkDto convertToDto(Bookmark bookmark) {
        BookmarkDto dto = new BookmarkDto();
        dto.setId(bookmark.getId());
        dto.setCreatedAt(bookmark.getCreatedAt().toString());

        if (bookmark.getNews() != null) {
            dto.setNewsId(bookmark.getNews().getId());
            dto.setNewsTitle(bookmark.getNews().getTitle());
        }

        if (bookmark.getEvent() != null) {
            dto.setEventId(bookmark.getEvent().getId());
            dto.setEventTitle(bookmark.getEvent().getTitle());
        }

        return dto;
    }
}

