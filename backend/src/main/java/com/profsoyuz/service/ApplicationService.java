package com.profsoyuz.service;

import com.profsoyuz.dto.ApplicationResponse;
import com.profsoyuz.model.Application;
import com.profsoyuz.model.ApplicationStatus;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
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
    public Application createApplication(User user, String text, String fileUrl) {  // ← исправлено
        Application application = new Application();
        application.setUser(user);
        application.setText(text);
        application.setFileUrl(fileUrl);
        application.setStatus(ApplicationStatus.PENDING);
        application.setCreatedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        return applicationRepository.save(application);
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

        return applicationRepository.save(application);
    }

    public ApplicationResponse convertToResponse(Application application) {  // ← исправлено
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getId());
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
