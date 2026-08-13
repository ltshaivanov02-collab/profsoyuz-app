package com.profsoyuz.dto;

public class MonthlyStatsDto {
    private String month;
    private long registrationsCount;

    public MonthlyStatsDto() {
    }

    public MonthlyStatsDto(String month, long registrationsCount) {
        this.month = month;
        this.registrationsCount = registrationsCount;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public long getRegistrationsCount() { return registrationsCount; }
    public void setRegistrationsCount(long registrationsCount) { this.registrationsCount = registrationsCount; }
}
