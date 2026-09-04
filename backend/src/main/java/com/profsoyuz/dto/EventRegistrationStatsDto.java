package com.profsoyuz.dto;

public class EventRegistrationStatsDto {
    private Long eventId;
    private String eventTitle;
    private Long registrationsCount;

    public EventRegistrationStatsDto() {
    }

    public EventRegistrationStatsDto(Long eventId, String eventTitle, Long registrationsCount) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.registrationsCount = registrationsCount;
    }

    public Long getEventId() {
        return eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public Long getRegistrationsCount() {
        return registrationsCount;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public void setRegistrationsCount(Long registrationsCount) {
        this.registrationsCount = registrationsCount;
    }
}

