package com.profsoyuz.service;

import com.profsoyuz.dto.NewsResponse;
import com.profsoyuz.model.News;
import com.profsoyuz.model.ReactionType;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.NewsReactionRepository;
import com.profsoyuz.repository.NewsRepository;
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
public class NewsService {

    private final NewsRepository newsRepository;
    private final NewsReactionRepository newsReactionRepository;

    public NewsService(NewsRepository newsRepository, NewsReactionRepository newsReactionRepository) {
        this.newsRepository = newsRepository;
        this.newsReactionRepository = newsReactionRepository;
    }

    // ============================================
    // ПОЛУЧЕНИЕ ВСЕХ НОВОСТЕЙ (БЕЗ ПАГИНАЦИИ)
    // ============================================

    public List<NewsResponse> getAllNews() {
        return newsRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================
    // ПОЛУЧЕНИЕ НОВОСТЕЙ С ПАГИНАЦИЕЙ (НОВОЕ!)
    // ============================================

    public Page<NewsResponse> getNewsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return newsRepository.findAll(pageable)
                .map(this::convertToResponse);
    }

    // ============================================
    // ПОЛУЧЕНИЕ НОВОСТИ ПО ID
    // ============================================

    public News getNewsById(Long id) {
        return newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
    }

    // ============================================
    // СОЗДАНИЕ НОВОСТИ
    // ============================================

    @Transactional
    public News createNews(String title, String content, String imageUrl, User author) {
        News news = new News();
        news.setTitle(title);
        news.setContent(content);
        news.setImageUrl(imageUrl);
        news.setAuthor(author);
        news.setCreatedAt(LocalDateTime.now());
        news.setUpdatedAt(LocalDateTime.now());

        return newsRepository.save(news);
    }

    // ============================================
    // ОБНОВЛЕНИЕ НОВОСТИ
    // ============================================

    @Transactional
    public News updateNews(Long id, String title, String content, String imageUrl) {
        News news = getNewsById(id);
        news.setTitle(title);
        news.setContent(content);
        news.setImageUrl(imageUrl);
        news.setUpdatedAt(LocalDateTime.now());

        return newsRepository.save(news);
    }

    // ============================================
    // УДАЛЕНИЕ НОВОСТИ
    // ============================================

    @Transactional
    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }

    // ============================================
    // ПРОВЕРКА СУЩЕСТВОВАНИЯ
    // ============================================

    public boolean existsById(Long id) {
        return newsRepository.existsById(id);
    }

    // ============================================
    // ПРЕОБРАЗОВАНИЕ ENTITY → DTO
    // ============================================

    public NewsResponse convertToResponse(News news) {
        NewsResponse response = new NewsResponse();
        response.setId(news.getId());
        response.setTitle(news.getTitle());
        response.setContent(news.getContent());
        response.setImageUrl(news.getImageUrl());
        response.setCreatedAt(news.getCreatedAt());
        response.setUpdatedAt(news.getUpdatedAt());
        response.setAuthorName(news.getAuthor() != null ? news.getAuthor().getFullName() : "Unknown");

        long likesCount = newsReactionRepository.countByNewsIdAndReactionType(news.getId(), ReactionType.LIKE);
        long heartsCount = newsReactionRepository.countByNewsIdAndReactionType(news.getId(), ReactionType.HEART);
        long firesCount = newsReactionRepository.countByNewsIdAndReactionType(news.getId(), ReactionType.FIRE);
        long clapsCount = newsReactionRepository.countByNewsIdAndReactionType(news.getId(), ReactionType.CLAP);

        response.setLikesCount(likesCount);
        response.setHeartsCount(heartsCount);
        response.setFiresCount(firesCount);
        response.setClapsCount(clapsCount);
        response.setTotalReactionsCount(likesCount + heartsCount + firesCount + clapsCount);

        return response;
    }
}
