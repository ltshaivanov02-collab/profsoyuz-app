package com.profsoyuz.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "admin_answer", columnDefinition = "TEXT")
    private String adminAnswer;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionStatus status = QuestionStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    // ============================================
    // КОНСТРУКТОРЫ
    // ============================================

    public Question() {
    }

    public Question(Long id, User user, String text, String adminAnswer,
                    User admin, QuestionStatus status,
                    LocalDateTime createdAt, LocalDateTime answeredAt) {
        this.id = id;
        this.user = user;
        this.text = text;
        this.adminAnswer = adminAnswer;
        this.admin = admin;
        this.status = status;
        this.createdAt = createdAt;
        this.answeredAt = answeredAt;
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

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public QuestionStatus getStatus() {
        return status;
    }

    public void setStatus(QuestionStatus status) {
        this.status = status;
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

    // ============================================
    // toString()
    // ============================================

    @Override
    public String toString() {
        return "Question{" +
                "id=" + id +
                ", user=" + (user != null ? user.getUsername() : "null") +
                ", status=" + status +
                ", admin=" + (admin != null ? admin.getUsername() : "null") +
                ", createdAt=" + createdAt +
                '}';
    }
}
