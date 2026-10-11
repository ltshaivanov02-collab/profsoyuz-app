package com.profsoyuz.repository;

import com.profsoyuz.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Все уведомления пользователя (свежие сверху)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Непрочитанные
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Количество непрочитанных
    long countByUserIdAndIsReadFalse(Long userId);

    // Удалить все уведомления пользователя
    @Modifying
    void deleteByUserId(Long userId);

    // Пометить все как прочитанные
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") Long userId);
}