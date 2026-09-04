package com.profsoyuz.service;

import com.profsoyuz.dto.DashboardStatsDto;
import com.profsoyuz.dto.EventPopularityDto;
import com.profsoyuz.dto.MonthlyStatsDto;
import com.profsoyuz.model.ApplicationStatus;
import com.profsoyuz.model.QuestionStatus;
import com.profsoyuz.model.TaskStatus;
import com.profsoyuz.repository.*;
import org.springframework.stereotype.Service;
import com.profsoyuz.dto.EventRegistrationStatsDto;
import java.time.LocalDateTime;

import java.util.List;

@Service
public class StatisticsService {

    private final UserRepository userRepository;
    private final NewsRepository newsRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ApplicationRepository applicationRepository;
    private final QuestionRepository questionRepository;
    private final TaskRepository taskRepository;  // ← ДОБАВЛЕНО!

    public StatisticsService(UserRepository userRepository,
                             NewsRepository newsRepository,
                             EventRepository eventRepository,
                             EventRegistrationRepository eventRegistrationRepository,
                             ApplicationRepository applicationRepository,
                             QuestionRepository questionRepository,
                             TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.newsRepository = newsRepository;
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.applicationRepository = applicationRepository;
        this.questionRepository = questionRepository;
        this.taskRepository = taskRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        return new DashboardStatsDto(
                // Основные сущности
                userRepository.count(),
                newsRepository.count(),
                eventRepository.count(),
                applicationRepository.count(),
                applicationRepository.countByStatus(ApplicationStatus.PENDING),
                questionRepository.count(),
                questionRepository.countByStatus(QuestionStatus.PENDING),

                // ============================================
                // ЗАДАЧИ (НОВОЕ!)
                // ============================================
                taskRepository.count(),
                taskRepository.countByStatus(TaskStatus.PENDING),
                taskRepository.countByStatus(TaskStatus.IN_PROGRESS),
                taskRepository.countByStatus(TaskStatus.COMPLETED),
                taskRepository.countByStatus(TaskStatus.CANCELLED)
        );
    }


    public List<EventPopularityDto> getEventPopularity() {
        return eventRegistrationRepository.findEventPopularity();
    }

    public List<MonthlyStatsDto> getMonthlyRegistrations() {
        return eventRegistrationRepository.findMonthlyRegistrations();
    }

    public List<EventRegistrationStatsDto> getEventRegistrationStats(String period) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = switch (period.toLowerCase()) {
            case "month" -> end.minusMonths(1);
            case "quarter" -> end.minusMonths(3);
            case "year" -> end.minusYears(1);
            default -> end.minusMonths(1);
        };
        return eventRegistrationRepository.getEventRegistrationStats(start, end);
    }
}
