package com.profsoyuz.dto;

import java.time.LocalDateTime;

public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dateTime;
    private String location;
    private Integer maxParticipants;
    private Integer registeredCount;
    private Integer remainingPlaces;
    private Boolean isFullyBooked;
    private String createdByName;
    private LocalDateTime createdAt;

    public EventResponse() {
    }

    public EventResponse(Long id,
                         String title,
                         String description,
                         LocalDateTime dateTime,
                         String location,
                         Integer maxParticipants,
                         Integer registeredCount,
                         Integer remainingPlaces,
                         Boolean isFullyBooked,
                         String createdByName,
                         LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.location = location;
        this.maxParticipants = maxParticipants;
        this.registeredCount = registeredCount;
        this.remainingPlaces = remainingPlaces;
        this.isFullyBooked = isFullyBooked;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public Integer getRegisteredCount() {
        return registeredCount;
    }

    public void setRegisteredCount(Integer registeredCount) {
        this.registeredCount = registeredCount;
    }

    public Integer getRemainingPlaces() {
        return remainingPlaces;
    }

    public void setRemainingPlaces(Integer remainingPlaces) {
        this.remainingPlaces = remainingPlaces;
    }

    public Boolean getFullyBooked() {
        return isFullyBooked;
    }

    public void setFullyBooked(Boolean fullyBooked) {
        isFullyBooked = fullyBooked;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
