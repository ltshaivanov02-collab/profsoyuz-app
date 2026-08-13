package com.profsoyuz.dto;

public class EventPopularityDto {
    private Long eventId;
    private String eventTitle;
    private long participantsCount;

    public EventPopularityDto() {
    }

    public EventPopularityDto(Long eventId, String eventTitle, long participantsCount) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.participantsCount = participantsCount;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
    public long getParticipantsCount() { return participantsCount; }
    public void setParticipantsCount(long participantsCount) { this.participantsCount = participantsCount; }
}
