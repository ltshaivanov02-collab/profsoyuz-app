package com.profsoyuz.dto;

public class EventParticipantDto {
    private Long userId;
    private String fullName;
    private String email;
    private Integer quantity;
    private String registeredAt;

    public EventParticipantDto() {
    }

    public EventParticipantDto(Long userId, String fullName, String email,
                               Integer quantity, String registeredAt) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.quantity = quantity;
        this.registeredAt = registeredAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getRegisteredAt() {
        return registeredAt;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setRegisteredAt(String registeredAt) {
        this.registeredAt = registeredAt;
    }
}
