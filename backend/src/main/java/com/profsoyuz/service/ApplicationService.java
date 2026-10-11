package com.profsoyuz.service;

import com.profsoyuz.dto.ApplicationResponse;
import com.profsoyuz.model.Application;
import com.profsoyuz.model.ApplicationStatus;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.profsoyuz.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;


    public ApplicationService(ApplicationRepository applicationRepository, NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
    }

    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsByStatus(ApplicationStatus applicationStatus) {
        return applicationRepository.findByStatus(applicationStatus)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsByUser(Long userId) {
        return applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    @Transactional
    public Application createApplication(User user, String subject, String text, String fileUrl) {
        Application application = new Application();
        application.setUser(user);
        application.setSubject(subject);
        application.setText(text);
        application.setFileUrl(fileUrl);
        application.setStatus(ApplicationStatus.PENDING);
        application.setCreatedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        Application saved = applicationRepository.save(application);

        // ✅ УВЕДОМЛЕНИЕ ВСЕМ ADMIN и BOSS
        notificationService.createNotificationForAdmins(
                "application",
                "📋 Новая заявка",
                (user.getFullName() != null ? user.getFullName() : user.getUsername())
                        + ": " + (subject != null ? subject : "Без темы"),
                "admin.html"
        );

        // ✅ УВЕДОМЛЕНИЕ АВТОРУ (подтверждение)
        notificationService.createNotification(
                user.getId(),
                "application",
                "✅ Заявка отправлена",
                "Ваша заявка \"" + (subject != null ? subject : "Без темы") + "\" принята на рассмотрение",
                "profile.html"
        );

        return saved;
    }

    @Transactional
    public Application processApplication(Long applicationId,
                                          ApplicationStatus status,
                                          String adminResponse,
                                          User admin) {
        Application application = getApplicationById(applicationId);

        application.setStatus(status);
        application.setAdminResponse(adminResponse);
        application.setAdmin(admin);
        application.setUpdatedAt(LocalDateTime.now());

        Application saved = applicationRepository.save(application);

        // ✅ УВЕДОМЛЕНИЕ АВТОРУ О РЕШЕНИИ
        String statusText = status == ApplicationStatus.APPROVED ? "одобрена ✅" : "отклонена ❌";
        notificationService.createNotification(
                application.getUser().getId(),
                "application",
                "📋 Заявка обработана",
                "Ваша заявка \"" + application.getSubject() + "\" " + statusText,
                "profile.html"
        );

        return saved;
    }

    public ApplicationResponse convertToResponse(Application application) {  // ← исправлено
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getId());
        response.setSubject(application.getSubject());
        response.setText(application.getText());
        response.setFileUrl(application.getFileUrl());
        response.setStatus(application.getStatus());
        response.setAdminResponse(application.getAdminResponse());
        response.setUserName(application.getUser() != null ? application.getUser().getFullName() : "Unknown");
        response.setAdminName(application.getAdmin() != null ? application.getAdmin().getFullName() : null);
        response.setCreatedAt(application.getCreatedAt());
        response.setUpdatedAt(application.getUpdatedAt());

        return response;
    }


}
