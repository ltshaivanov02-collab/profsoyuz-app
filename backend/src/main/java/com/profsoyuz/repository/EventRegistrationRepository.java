package com.profsoyuz.repository;

import com.profsoyuz.dto.EventPopularityDto;
import com.profsoyuz.dto.EventRegistrationStatsDto;
import com.profsoyuz.dto.MonthlyStatsDto;
import com.profsoyuz.model.Event;
import com.profsoyuz.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.profsoyuz.dto.EventParticipantDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    Optional<EventRegistration> findByUserIdAndEventId(Long userId, Long eventId);

    List<EventRegistration> findByUserId(Long userId);

    List<EventRegistration> findByEventId(Long eventId);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    void deleteByUserIdAndEventId(Long userId, Long eventId);

    @Query("SELECT SUM(er.quantity) FROM EventRegistration er WHERE er.event.id = :eventId")
    Integer sumQuantityByEventId(@Param("eventId") Long eventId);

    @Query("""
        SELECT new com.profsoyuz.dto.EventPopularityDto(
            e.id,
            e.title,
            COUNT(er.id)
        )
        FROM EventRegistration er
        JOIN er.event e
        GROUP BY e.id, e.title
        ORDER BY COUNT(er.id) DESC
    """)
    List<EventPopularityDto> findEventPopularity();

    @Query("""
        SELECT new com.profsoyuz.dto.MonthlyStatsDto(
            TO_CHAR(er.registeredAt, 'YYYY-MM'),
            COUNT(er.id)
        )
        FROM EventRegistration er
        GROUP BY TO_CHAR(er.registeredAt, 'YYYY-MM')
        ORDER BY TO_CHAR(er.registeredAt, 'YYYY-MM')
    """)
    List<MonthlyStatsDto> findMonthlyRegistrations();

    @Query("""
        SELECT er.event
        FROM EventRegistration er
        WHERE er.user.id = :userId
        AND er.event.dateTime BETWEEN :start AND :end
        ORDER BY er.event.dateTime ASC
    """)
    List<Event> findUserEventsBetween(@Param("userId") Long userId,
                                      @Param("start") LocalDateTime start,
                                      @Param("end") LocalDateTime end);


    @Query("""
    SELECT new com.profsoyuz.dto.EventRegistrationStatsDto(
        e.id,
        e.title,
        COUNT(er.id)
    )
    
    FROM EventRegistration er
    JOIN er.event e
    WHERE er.registeredAt BETWEEN :start AND :end
    GROUP BY e.id, e.title
    ORDER BY COUNT(er.id) DESC
""")
    List<EventRegistrationStatsDto> getEventRegistrationStats(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
    SELECT new com.profsoyuz.dto.EventParticipantDto(
        u.id,
        u.fullName,
        u.email,
        er.quantity,
        TO_CHAR(er.registeredAt, 'YYYY-MM-DD HH24:MI')
    )
    FROM EventRegistration er
    JOIN er.user u
    WHERE er.event.id = :eventId
    ORDER BY er.registeredAt DESC
""")
    List<EventParticipantDto> getEventParticipants(@Param("eventId") Long eventId);
}
