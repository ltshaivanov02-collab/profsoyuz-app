package com.profsoyuz.dto;

public class DashboardStatsDto {
    private long totalUsers;
    private long totalNews;
    private long totalEvents;
    private long totalApplications;
    private long pendingApplications;
    private long totalQuestions;
    private long pendingQuestions;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalUsers, long totalNews, long totalEvents,
                             long totalApplications, long pendingApplications,
                             long totalQuestions, long pendingQuestions) {
        this.totalUsers = totalUsers;
        this.totalNews = totalNews;
        this.totalEvents = totalEvents;
        this.totalApplications = totalApplications;
        this.pendingApplications = pendingApplications;
        this.totalQuestions = totalQuestions;
        this.pendingQuestions = pendingQuestions;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalNews() { return totalNews; }
    public void setTotalNews(long totalNews) { this.totalNews = totalNews; }
    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }
    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }
    public long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }
    public long getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(long totalQuestions) { this.totalQuestions = totalQuestions; }
    public long getPendingQuestions() { return pendingQuestions; }
    public void setPendingQuestions(long pendingQuestions) { this.pendingQuestions = pendingQuestions; }
}

