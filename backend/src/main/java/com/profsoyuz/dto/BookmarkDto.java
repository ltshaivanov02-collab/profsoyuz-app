package com.profsoyuz.dto;

public class BookmarkDto {

    private Long id;
    private Long newsId;
    private String newsTitle;
    private Long eventId;
    private String eventTitle;
    private String createdAt;

    public BookmarkDto() {
    }

    public BookmarkDto(Long id, Long newsId, String newsTitle,
                       Long eventId, String eventTitle, String createdAt) {
        this.id = id;
        this.newsId = newsId;
        this.newsTitle = newsTitle;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getNewsId() { return newsId; }
    public void setNewsId(Long newsId) { this.newsId = newsId; }

    public String getNewsTitle() { return newsTitle; }
    public void setNewsTitle(String newsTitle) { this.newsTitle = newsTitle; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
