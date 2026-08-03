package com.profsoyuz.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news_reactions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "news_id"})
        })
public class NewsReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "news_id", nullable = false)
    private News news;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false)
    private ReactionType reactionType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ============================================
    // КОНСТРУКТОРЫ
    // ============================================

    public NewsReaction() {
    }

    public NewsReaction(Long id, User user, News news, ReactionType reactionType, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.news = news;
        this.reactionType = reactionType;
        this.createdAt = createdAt;
    }

    // ============================================
    // ГЕТТЕРЫ И СЕТТЕРЫ
    // ============================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public News getNews() {
        return news;
    }

    public void setNews(News news) {
        this.news = news;
    }

    public ReactionType getReactionType() {
        return reactionType;
    }

    public void setReactionType(ReactionType reactionType) {
        this.reactionType = reactionType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ============================================
    // toString()
    // ============================================

    @Override
    public String toString() {
        return "NewsReaction{" +
                "id=" + id +
                ", user=" + (user != null ? user.getUsername() : "null") +
                ", news=" + (news != null ? news.getId() : "null") +
                ", reactionType=" + reactionType +
                ", createdAt=" + createdAt +
                '}';
    }
}



