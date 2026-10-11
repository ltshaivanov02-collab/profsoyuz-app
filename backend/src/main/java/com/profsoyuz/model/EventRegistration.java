package com.profsoyuz.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "event_id"})
        })
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "members_count")
    private Integer membersCount = 1;

    @Column(name = "relatives_count")
    private Integer relativesCount = 0;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    // ============================================
    // КОНСТРУКТОРЫ
    // ============================================

    public EventRegistration() {
    }

    public EventRegistration(Long id,
                             User user,
                             Event event,
                             Integer quantity,
                             Integer membersCount,
                             Integer relativesCount,
                             String comment,
                             LocalDateTime registeredAt) {
        this.id = id;
        this.user = user;
        this.event = event;
        this.quantity = quantity;
        this.membersCount = membersCount;
        this.relativesCount = relativesCount;
        this.comment = comment;
        this.registeredAt = registeredAt;
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

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getMembersCount() { return membersCount; }
    public void setMembersCount(Integer membersCount) { this.membersCount = membersCount; }

    public Integer getRelativesCount() { return relativesCount; }
    public void setRelativesCount(Integer relativesCount) { this.relativesCount = relativesCount; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    // ============================================
    // toString()
    // ============================================

    @Override
    public String toString() {
        return "EventRegistration{" +
                "id=" + id +
                ", user=" + (user != null ? user.getUsername() : "null") +
                ", event=" + (event != null ? event.getId() : "null") +
                ", quantity=" + quantity +
                ", membersCount=" + membersCount +           // ✅ ДОБАВЛЕНО
                ", relativesCount=" + relativesCount +       // ✅ ДОБАВЛЕНО
                ", comment='" + comment + '\'' +
                ", registeredAt=" + registeredAt +
                '}';
    }
}