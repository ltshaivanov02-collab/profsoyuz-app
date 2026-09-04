package com.profsoyuz.repository;

import com.profsoyuz.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    List<Bookmark> findByUserId(Long userId);

    Optional<Bookmark> findByUserIdAndNewsId(Long userId, Long newsId);

    Optional<Bookmark> findByUserIdAndEventId(Long userId, Long eventId);

    boolean existsByUserIdAndNewsId(Long userId, Long newsId);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    void deleteByUserIdAndNewsId(Long userId, Long newsId);

    void deleteByUserIdAndEventId(Long userId, Long eventId);
}

