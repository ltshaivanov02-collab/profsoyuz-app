package com.profsoyuz.service;

import com.profsoyuz.model.Bookmark;
import com.profsoyuz.model.Event;
import com.profsoyuz.model.News;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.BookmarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

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
        News news = newsService.getNewsById(newsId);
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
        bookmarkRepository.deleteByUserIdAndEventId(userId, eventId);
    }

    public boolean isEventBookmarked(Long userId, Long eventId) {
        return bookmarkRepository.existsByUserIdAndEventId(userId, eventId);
    }

    // ============================================
    // ПОЛУЧЕНИЕ ВСЕХ ЗАКЛАДОК ПОЛЬЗОВАТЕЛЯ
    // ============================================

    public List<Bookmark> getUserBookmarks(Long userId) {
        return bookmarkRepository.findByUserId(userId);
    }
}

