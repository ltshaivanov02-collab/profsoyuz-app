package com.profsoyuz.dto;

public class DashboardStatsDto {

    private long totalUsers;
    private long totalNews;
    private long totalEvents;
    private long totalApplications;
    private long pendingApplications;
    private long totalQuestions;
    private long pendingQuestions;


    private long totalTasks;
    private long pendingTasks;
    private long inProgressTasks;
    private long completedTasks;
    private long cancelledTasks;


    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalUsers, long totalNews, long totalEvents,
                             long totalApplications, long pendingApplications,
                             long totalQuestions, long pendingQuestions,
                             long totalTasks, long pendingTasks,
                             long inProgressTasks, long completedTasks,
                             long cancelledTasks) {
        this.totalUsers = totalUsers;
        this.totalNews = totalNews;
        this.totalEvents = totalEvents;
        this.totalApplications = totalApplications;
        this.pendingApplications = pendingApplications;
        this.totalQuestions = totalQuestions;
        this.pendingQuestions = pendingQuestions;
        this.totalTasks = totalTasks;
        this.pendingTasks = pendingTasks;
        this.inProgressTasks = inProgressTasks;
        this.completedTasks = completedTasks;
        this.cancelledTasks = cancelledTasks;
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

    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }

    public long getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(long pendingTasks) { this.pendingTasks = pendingTasks; }

    public long getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(long inProgressTasks) { this.inProgressTasks = inProgressTasks; }

    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }

    public long getCancelledTasks() { return cancelledTasks; }
    public void setCancelledTasks(long cancelledTasks) { this.cancelledTasks = cancelledTasks; }
}

