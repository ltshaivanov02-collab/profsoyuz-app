package com.profsoyuz.dto;

import java.time.LocalDateTime;

public class NewsResponse {

    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String authorName;

    private long likesCount;
    private long heartsCount;
    private long firesCount;
    private long clapsCount;
    private long totalReactionsCount;


    public NewsResponse() {
    }

    public NewsResponse(Long id, String title, String content, String imageUrl,
                        LocalDateTime createdAt, LocalDateTime updatedAt,
                        String authorName) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.authorName = authorName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public long getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(long likesCount) {
        this.likesCount = likesCount;
    }

    public long getHeartsCount() {
        return heartsCount;
    }

    public void setHeartsCount(long heartsCount) {
        this.heartsCount = heartsCount;
    }

    public long getFiresCount() {
        return firesCount;
    }

    public void setFiresCount(long firesCount) {
        this.firesCount = firesCount;
    }

    public long getClapsCount() {
        return clapsCount;
    }

    public void setClapsCount(long clapsCount) {
        this.clapsCount = clapsCount;
    }

    public long getTotalReactionsCount() {
        return totalReactionsCount;
    }

    public void setTotalReactionsCount(long totalReactionsCount) {
        this.totalReactionsCount = totalReactionsCount;
    }
}
