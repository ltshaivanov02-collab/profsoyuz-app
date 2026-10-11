package com.profsoyuz.repository;

import com.profsoyuz.model.EventReaction;
import com.profsoyuz.model.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventReactionRepository extends JpaRepository<EventReaction, Long> {

    Optional<EventReaction> findByUserIdAndEventId(Long userId, Long eventId);

    List<EventReaction> findByUserId(Long userId);

    long countByEventIdAndReactionType(Long eventId, ReactionType reactionType);

    long countByEventId(Long eventId);

    void deleteByUserIdAndEventId(Long userId, Long eventId);
}