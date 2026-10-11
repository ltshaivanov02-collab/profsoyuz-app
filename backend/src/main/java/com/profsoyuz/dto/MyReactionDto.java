package com.profsoyuz.dto;

import java.time.LocalDateTime;

public class MyReactionDto {

    private Long newsId;
    private String newsTitle;
    private String reactionType;
    private LocalDateTime createdAt;

    public MyReactionDto() {
    }

    public MyReactionDto(Long newsId, String newsTitle, String reactionType, LocalDateTime createdAt) {
        this.newsId = newsId;
        this.newsTitle = newsTitle;
        this.reactionType = reactionType;
        this.createdAt = createdAt;
    }

    public Long getNewsId() { return newsId; }
    public void setNewsId(Long newsId) { this.newsId = newsId; }

    public String getNewsTitle() { return newsTitle; }
    public void setNewsTitle(String newsTitle) { this.newsTitle = newsTitle; }

    public String getReactionType() { return reactionType; }
    public void setReactionType(String reactionType) { this.reactionType = reactionType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}