package com.profsoyuz.controller;

import com.profsoyuz.dto.NewsResponse;
import com.profsoyuz.model.News;
import com.profsoyuz.model.ReactionType;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.NewsReactionRepository;
import com.profsoyuz.service.BookmarkService;
import com.profsoyuz.service.NewsService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;
    private final NewsReactionRepository newsReactionRepository;
    private final BookmarkService bookmarkService;

    public NewsController(NewsService newsService,
                          NewsReactionRepository newsReactionRepository,
                          BookmarkService bookmarkService) {
        this.newsService = newsService;
        this.newsReactionRepository = newsReactionRepository;
        this.bookmarkService = bookmarkService;
    }

    // ============================================
    // ПОЛУЧИТЬ ВСЕ НОВОСТИ (БЕЗ ПАГИНАЦИИ)
    // ============================================

    @GetMapping
    public List<NewsResponse> getAllNews() {
        return newsService.getAllNews();
    }

    // ============================================
    // ПОЛУЧИТЬ НОВОСТИ С ПАГИНАЦИЕЙ (НОВОЕ!)
    // ============================================

    @GetMapping("/paged")
    public Page<NewsResponse> getNewsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return newsService.getNewsPaginated(page, size);
    }

    // ============================================
    // ПОЛУЧИТЬ НОВОСТЬ ПО ID
    // ============================================

    @GetMapping("/{id}")
    public NewsResponse getNewsbyId(@PathVariable Long id) {
        News news = newsService.getNewsById(id);
        return newsService.convertToResponse(news);
    }

    // ============================================
    // СОЗДАТЬ НОВОСТЬ (ТОЛЬКО ADMIN/BOSS)
    // ============================================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public NewsResponse createNews(@RequestBody CreateNewsRequest request,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        User author = (User) userDetails;
        if (author == null) {
            throw new RuntimeException("User not authenticated");
        }
        News news = newsService.createNews(
                request.getTitle(),
                request.getContent(),
                request.getImageUrl(),
                author
        );
        return newsService.convertToResponse(news);
    }

    // ============================================
    // ОБНОВИТЬ НОВОСТЬ (ТОЛЬКО ADMIN/BOSS)
    // ============================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public NewsResponse updateNews(@PathVariable Long id,
                                   @RequestBody CreateNewsRequest request) {
        News news = newsService.updateNews(
                id,
                request.getTitle(),
                request.getContent(),
                request.getImageUrl()
        );
        return newsService.convertToResponse(news);
    }

    // ============================================
    // УДАЛИТЬ НОВОСТЬ (ТОЛЬКО ADMIN/BOSS)
    // ============================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public void deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
    }

    // ============================================
    // РЕАКЦИИ НА НОВОСТИ
    // ============================================

    @PostMapping("/{id}/reactions")
    public void addReaction(@PathVariable Long id,
                            @RequestParam ReactionType type,
                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        newsReactionRepository.findByUserIdAndNewsId(user.getId(), id)
                .ifPresentOrElse(
                        reaction -> {
                            reaction.setReactionType(type);
                            newsReactionRepository.save(reaction);
                        },
                        () -> {
                            com.profsoyuz.model.NewsReaction reaction = new com.profsoyuz.model.NewsReaction();
                            reaction.setUser(user);
                            reaction.setNews(newsService.getNewsById(id));
                            reaction.setReactionType(type);
                            newsReactionRepository.save(reaction);
                        }
                );
    }

    @DeleteMapping("/{id}/reactions")
    public void removeReaction(@PathVariable Long id,
                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        newsReactionRepository.deleteByUserIdAndNewsId(user.getId(), id);
    }

    // ============================================
    // ЗАКЛАДКИ НА НОВОСТИ
    // ============================================

    @PostMapping("/{id}/bookmark")
    public String addBookmark(@PathVariable Long id,
                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        bookmarkService.addNewsBookmark(user.getId(), id);
        return "News bookmarked successfully";
    }

    @DeleteMapping("/{id}/bookmark")
    public String removeBookmark(@PathVariable Long id,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        bookmarkService.removeNewsBookmark(user.getId(), id);
        return "News unbookmarked successfully";
    }

    @GetMapping("/{id}/bookmarked")
    public boolean isBookmarked(@PathVariable Long id,
                                @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return bookmarkService.isNewsBookmarked(user.getId(), id);
    }

    // ============================================
    // ВНУТРЕННИЙ DTO ДЛЯ СОЗДАНИЯ НОВОСТИ
    // ============================================

    public static class CreateNewsRequest {
        private String title;
        private String content;
        private String imageUrl;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
}
