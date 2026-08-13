package com.profsoyuz.repository;

import com.profsoyuz.model.NewsReaction;
import com.profsoyuz.model.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NewsReactionRepository extends JpaRepository<NewsReaction, Long> {
    Optional<NewsReaction> findByUserIdAndNewsId(Long userId, Long newsId);
    long countByNewsIdAndReactionType(long newsId, ReactionType reactionType);
    long countByNewsId(Long newsId);
    void deleteByUserIdAndNewsId (Long userId, Long newsId);


}
