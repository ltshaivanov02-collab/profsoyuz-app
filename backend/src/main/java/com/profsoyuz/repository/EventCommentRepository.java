package com.profsoyuz.repository;

import com.profsoyuz.model.EventComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventCommentRepository extends JpaRepository<EventComment, Long> {

    // Все комментарии события (новые сверху)
    List<EventComment> findByEventIdOrderByCreatedAtDesc(Long eventId);

    // Количество комментариев
    long countByEventId(Long eventId);
}
