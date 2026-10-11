package com.profsoyuz.controller;

import com.profsoyuz.dto.ApplicationResponse;
import com.profsoyuz.model.Application;
import com.profsoyuz.model.ApplicationStatus;
import com.profsoyuz.model.User;
import com.profsoyuz.service.ApplicationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<ApplicationResponse> getAllApplications() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/my")
    public List<ApplicationResponse> getMyApplications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return applicationService.getApplicationsByUser(user.getId());
    }

    // Получить заявку по ID
    @GetMapping("/{id:\\d+}")
    public ApplicationResponse getApplicationById(@PathVariable Long id) {
        Application application = applicationService.getApplicationById(id);
        return applicationService.convertToResponse(application);
    }

    @PostMapping
    public ApplicationResponse createApplication(@RequestBody CreateApplicationRequest request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Application application = applicationService.createApplication(
                user,
                request.getSubject(),
                request.getText(),
                request.getFileUrl()
        );
        return applicationService.convertToResponse(application);
    }


    @PutMapping("/{id}/process")
    public ApplicationResponse processApplication(@PathVariable Long id,
                                                  @RequestBody ProcessRequest request,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        User admin = (User) userDetails;
        Application application = applicationService.processApplication(
                id,
                request.getStatus(),
                request.getAdminResponse(),
                admin
        );
        return applicationService.convertToResponse(application);
    }


    public static class CreateApplicationRequest {
        private String subject;
        private String text;
        private String fileUrl;

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    }

    public static class ProcessRequest {
        private ApplicationStatus status;
        private String adminResponse;

        public ApplicationStatus getStatus() { return status; }
        public void setStatus(ApplicationStatus status) { this.status = status; }
        public String getAdminResponse() { return adminResponse; }
        public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
    }
}
