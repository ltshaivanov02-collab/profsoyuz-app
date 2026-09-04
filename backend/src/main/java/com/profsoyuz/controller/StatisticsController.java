package com.profsoyuz.controller;

import com.profsoyuz.dto.DashboardStatsDto;
import com.profsoyuz.dto.EventPopularityDto;
import com.profsoyuz.dto.EventRegistrationStatsDto;
import com.profsoyuz.dto.MonthlyStatsDto;
import com.profsoyuz.service.StatisticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/dashboard")
    public DashboardStatsDto getDashboardStats() {
        return statisticsService.getDashboardStats();
    }

    @GetMapping("/events/popularity")
    public List<EventPopularityDto> getEventPopularity() {
        return statisticsService.getEventPopularity();
    }

    @GetMapping("/registrations/dynamics")
    public List<MonthlyStatsDto> getMonthlyRegistrations() {
        return statisticsService.getMonthlyRegistrations();
    }

    @GetMapping("/events/registrations-stats")
    public List<EventRegistrationStatsDto> getEventRegistrationStats(
            @RequestParam(defaultValue = "month") String period) {
        return statisticsService.getEventRegistrationStats(period);
    }


}
