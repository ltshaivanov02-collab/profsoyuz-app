package com.profsoyuz.dto;
import com.profsoyuz.model.QuestionStatus;

import java.time.LocalDateTime;

public class QuestionResponse {
    private Long id;
    private String text;
    private String adminAnswer;
    private QuestionStatus status;
    private String userName;
    private String adminName;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;

    public QuestionResponse() {
    }

    public QuestionResponse(Long id, String text, String adminAnswer, QuestionStatus status,
                            String userName, String adminName,
                            LocalDateTime createdAt, LocalDateTime answeredAt) {
        this.id = id;
        this.text = text;
        this.adminAnswer = adminAnswer;
        this.status = status;
        this.userName = userName;
        this.adminName = adminName;
        this.createdAt = createdAt;
        this.answeredAt = answeredAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getAdminAnswer() {
        return adminAnswer;
    }

    public void setAdminAnswer(String adminAnswer) {
        this.adminAnswer = adminAnswer;
    }

    public QuestionStatus getStatus() {
        return status;
    }

    public void setStatus(QuestionStatus status) {
        this.status = status;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }

}
