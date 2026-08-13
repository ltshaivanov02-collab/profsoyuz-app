package com.profsoyuz.repository;

import com.profsoyuz.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    // Найти закладки пользователя
    List<Bookmark> findByUserId(Long userId);

    // Найти закладку по пользователю и новости
    Optional<Bookmark> findByUserIdAndNewsId(Long userId, Long newsId);

    // Найти закладку по пользователю и событию
    Optional<Bookmark> findByUserIdAndEventId(Long userId, Long eventId);

    // Проверить, есть ли закладка на новость
    boolean existsByUserIdAndNewsId(Long userId, Long newsId);

    // Проверить, есть ли закладка на событие
    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    // Удалить закладку на новость
    void deleteByUserIdAndNewsId(Long userId, Long newsId);

    // Удалить закладку на событие
    void deleteByUserIdAndEventId(Long userId, Long eventId);
}
