package com.profsoyuz.controller;

import com.profsoyuz.dto.NotificationDto;
import com.profsoyuz.model.User;
import com.profsoyuz.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ============================================
    // ПОЛУЧИТЬ ВСЕ УВЕДОМЛЕНИЯ
    // ============================================

    @GetMapping
    public List<NotificationDto> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return notificationService.getUserNotifications(user.getId());
    }

    // ============================================
    // КОЛИЧЕСТВО НЕПРОЧИТАННЫХ
    // ============================================

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        long count = notificationService.getUnreadCount(user.getId());
        return Map.of("count", count);
    }

    // ============================================
    // ПОМЕТИТЬ КАК ПРОЧИТАННОЕ
    // ============================================

    @PutMapping("/{id:\\d+}/read")
    public void markAsRead(@PathVariable Long id,
                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        notificationService.markAsRead(id, user.getId());
    }

    // ============================================
    // ПОМЕТИТЬ ВСЕ КАК ПРОЧИТАННЫЕ
    // ============================================

    @PutMapping("/read-all")
    public void markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        notificationService.markAllAsRead(user.getId());
    }

    // ============================================
    // УДАЛИТЬ УВЕДОМЛЕНИЕ
    // ============================================

    @DeleteMapping("/{id:\\d+}")
    public void deleteNotification(@PathVariable Long id,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        notificationService.deleteNotification(id, user.getId());
    }

    // ============================================
    // ОЧИСТИТЬ ВСЕ
    // ============================================

    @DeleteMapping("/clear-all")
    public void clearAll(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        notificationService.clearAll(user.getId());
    }
}