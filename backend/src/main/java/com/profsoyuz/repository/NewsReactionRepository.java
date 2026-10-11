package com.profsoyuz.repository;

import com.profsoyuz.model.NewsReaction;
import com.profsoyuz.model.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsReactionRepository extends JpaRepository<NewsReaction, Long> {

    // ============================================
    // СУЩЕСТВУЮЩИЕ МЕТОДЫ
    // ============================================

    Optional<NewsReaction> findByUserIdAndNewsId(Long userId, Long newsId);

    List<NewsReaction> findByUserId(Long userId);

    void deleteByUserIdAndNewsId(Long userId, Long newsId);

    // ============================================
    // ✅ НОВЫЕ МЕТОДЫ ДЛЯ ПОДСЧЁТА РЕАКЦИЙ
    // ============================================

    long countByNewsIdAndReactionType(Long newsId, ReactionType reactionType);

    long countByNewsId(Long newsId);
}
