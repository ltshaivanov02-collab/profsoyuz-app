package com.profsoyuz.dto;

import java.time.LocalDateTime;

public class CommentDto {
    private Long id;
    private String text;
    private String userName;
    private LocalDateTime createdAt;

    public CommentDto() {
    }

    public CommentDto(Long id, String text, String userName, LocalDateTime createdAt) {
        this.id = id;
        this.text = text;
        this.userName = userName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public String getUserName() {
        return userName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}