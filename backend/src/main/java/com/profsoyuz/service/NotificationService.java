package com.profsoyuz.service;

import com.profsoyuz.dto.NotificationDto;
import com.profsoyuz.model.Notification;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.NotificationRepository;
import com.profsoyuz.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ============================================
    // ПОЛУЧИТЬ УВЕДОМЛЕНИЯ ПОЛЬЗОВАТЕЛЯ
    // ============================================

    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ============================================
    // КОЛИЧЕСТВО НЕПРОЧИТАННЫХ
    // ============================================

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ============================================
    // СОЗДАТЬ УВЕДОМЛЕНИЕ ДЛЯ ОДНОГО ПОЛЬЗОВАТЕЛЯ
    // ============================================

    @Transactional
    public Notification createNotification(Long userId, String type, String title,
                                           String message, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }

    // ============================================
    // ✅ СОЗДАТЬ УВЕДОМЛЕНИЯ ВСЕМ ADMIN и BOSS
    // ============================================

    @Transactional
    public void createNotificationForAdmins(String type, String title,
                                            String message, String link) {
        List<User> admins = userRepository.findAll()
                .stream()
                .filter(u -> "ADMIN".equals(u.getRole().name()) ||
                        "BOSS".equals(u.getRole().name()))
                .collect(Collectors.toList());

        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setLink(link);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    // ============================================
    // ✅ СОЗДАТЬ УВЕДОМЛЕНИЕ ВСЕМ USER
    // ============================================

    @Transactional
    public void createNotificationForAllUsers(String type, String title,
                                              String message, String link) {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setLink(link);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    // ============================================
    // ПОМЕТИТЬ КАК ПРОЧИТАННОЕ
    // ============================================

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // ✅ Проверяем, что уведомление принадлежит пользователю
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    // ============================================
    // ПОМЕТИТЬ ВСЕ КАК ПРОЧИТАННЫЕ
    // ============================================

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // ============================================
    // УДАЛИТЬ УВЕДОМЛЕНИЕ
    // ============================================

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        notificationRepository.delete(notification);
    }

    // ============================================
    // ОЧИСТИТЬ ВСЕ УВЕДОМЛЕНИЯ
    // ============================================

    @Transactional
    public void clearAll(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }

    // ============================================
    // CONVERT TO DTO
    // ============================================

    private NotificationDto convertToDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.getLink(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}