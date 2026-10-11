package com.profsoyuz.controller;

import com.profsoyuz.dto.CommentDto;                          // ← ДОБАВИТЬ
import com.profsoyuz.dto.MyReactionDto;
import com.profsoyuz.dto.NewsResponse;
import com.profsoyuz.model.News;
import com.profsoyuz.model.NewsComment;                       // ← ДОБАВИТЬ
import com.profsoyuz.model.ReactionType;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.NewsCommentRepository;        // ← ДОБАВИТЬ
import com.profsoyuz.repository.NewsReactionRepository;
import com.profsoyuz.service.BookmarkService;
import com.profsoyuz.service.NewsService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;                               // ← ДОБАВИТЬ
import java.util.List;                                        // ← уже есть
import java.util.Map;                                         // ← ДОБАВИТЬ
import java.util.stream.Collectors;                           // ← уже есть

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;
    private final NewsReactionRepository newsReactionRepository;
    private final BookmarkService bookmarkService;
    private final NewsCommentRepository newsCommentRepository;  // ← ДОБАВИТЬ

    public NewsController(NewsService newsService,
                          NewsReactionRepository newsReactionRepository,
                          BookmarkService bookmarkService,
                          NewsCommentRepository newsCommentRepository) {  // ← ДОБАВИТЬ
        this.newsService = newsService;
        this.newsReactionRepository = newsReactionRepository;
        this.bookmarkService = bookmarkService;
        this.newsCommentRepository = newsCommentRepository;      // ← ДОБАВИТЬ
    }

    // ============================================
    // ПОЛУЧИТЬ ВСЕ НОВОСТИ
    // ============================================

    @GetMapping
    public List<NewsResponse> getAllNews() {
        return newsService.getAllNews();
    }

    // ============================================
    // ПОЛУЧИТЬ НОВОСТИ С ПАГИНАЦИЕЙ
    // ============================================

    @GetMapping("/paged")
    public Page<NewsResponse> getNewsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return newsService.getNewsPaginated(page, size);
    }

    // ============================================
    // СОЗДАТЬ НОВОСТЬ (ADMIN/BOSS)
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
    // ОБНОВИТЬ НОВОСТЬ (ADMIN/BOSS)
    // ============================================

    @PutMapping("/{id:\\d+}")
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
    // УДАЛИТЬ НОВОСТЬ (ADMIN/BOSS)
    // ============================================

    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public void deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
    }

    // ============================================
    // РЕАКЦИИ НА НОВОСТИ
    // ============================================

    @PostMapping("/{id:\\d+}/reactions")
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

    @DeleteMapping("/{id:\\d+}/reactions")
    @Transactional
    public void removeReaction(@PathVariable Long id,
                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        newsReactionRepository.deleteByUserIdAndNewsId(user.getId(), id);
    }

    // ============================================
    // ✅ НОВЫЙ ЭНДПОИНТ: МОИ РЕАКЦИИ
    // ============================================

    @GetMapping("/reactions/my")
    public List<MyReactionDto> getMyReactions(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return List.of();
        }

        User user = (User) userDetails;

        return newsReactionRepository.findByUserId(user.getId())
                .stream()
                .filter(reaction -> reaction.getNews() != null)
                .map(reaction -> new MyReactionDto(
                        reaction.getNews().getId(),
                        reaction.getNews().getTitle(),
                        reaction.getReactionType() != null ? reaction.getReactionType().name() : null,
                        reaction.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // ============================================
    // ЗАКЛАДКИ НА НОВОСТИ
    // ============================================

    @PostMapping("/{id:\\d+}/bookmark")
    public String addBookmark(@PathVariable Long id,
                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        bookmarkService.addNewsBookmark(user.getId(), id);
        return "News bookmarked successfully";
    }

    @DeleteMapping("/{id:\\d+}/bookmark")
    public String removeBookmark(@PathVariable Long id,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        bookmarkService.removeNewsBookmark(user.getId(), id);
        return "News unbookmarked successfully";
    }

    @GetMapping("/{id:\\d+}/bookmarked")
    public boolean isBookmarked(@PathVariable Long id,
                                @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return bookmarkService.isNewsBookmarked(user.getId(), id);
    }

    // ============================================
    // ПОЛУЧИТЬ НОВОСТЬ ПО ID (ПОСЛЕДНИМ!)
    // ============================================

    @GetMapping("/{id:\\d+}")
    public NewsResponse getNewsbyId(@PathVariable Long id) {
        News news = newsService.getNewsById(id);
        return newsService.convertToResponse(news);
    }

    // ============================================
    // ВНУТРЕННИЙ DTO
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

    @GetMapping("/{id:\\d+}/comments")
    public List<CommentDto> getComments(@PathVariable Long id) {
        return newsCommentRepository.findByNewsIdOrderByCreatedAtDesc(id)
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
        News news = newsService.getNewsById(id);

        NewsComment comment = new NewsComment();
        comment.setNews(news);
        comment.setUser(user);
        comment.setText(request.get("text"));
        comment.setCreatedAt(LocalDateTime.now());

        NewsComment saved = newsCommentRepository.save(comment);

        CommentDto dto = new CommentDto();
        dto.setId(saved.getId());
        dto.setText(saved.getText());
        dto.setUserName(user.getFullName());
        dto.setCreatedAt(saved.getCreatedAt());
        return dto;
    }
}
