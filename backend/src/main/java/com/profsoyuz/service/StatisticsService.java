package com.profsoyuz.service;

import com.profsoyuz.dto.DashboardStatsDto;
import com.profsoyuz.dto.EventPopularityDto;
import com.profsoyuz.dto.MonthlyStatsDto;
import com.profsoyuz.model.ApplicationStatus;
import com.profsoyuz.model.QuestionStatus;
import com.profsoyuz.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatisticsService {

    private final UserRepository userRepository;
    private final NewsRepository newsRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ApplicationRepository applicationRepository;
    private final QuestionRepository questionRepository;

    public StatisticsService(UserRepository userRepository,
                             NewsRepository newsRepository,
                             EventRepository eventRepository,
                             EventRegistrationRepository eventRegistrationRepository,
                             ApplicationRepository applicationRepository,
                             QuestionRepository questionRepository) {
        this.userRepository = userRepository;
        this.newsRepository = newsRepository;
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.applicationRepository = applicationRepository;
        this.questionRepository = questionRepository;
    }


    public DashboardStatsDto getDashboardStats() {
        return new DashboardStatsDto(
                userRepository.count(),
                newsRepository.count(),
                eventRepository.count(),
                applicationRepository.count(),
                applicationRepository.countByStatus(ApplicationStatus.PENDING),
                questionRepository.count(),
                questionRepository.countByStatus(QuestionStatus.PENDING)
        );
    }

    public List<EventPopularityDto> getEventPopularity() {
        return eventRegistrationRepository.findEventPopularity();
    }

    public List<MonthlyStatsDto> getMonthlyRegistrations() {
        return eventRegistrationRepository.findMonthlyRegistrations();
    }
}
