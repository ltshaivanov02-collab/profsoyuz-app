package com.profsoyuz.repository;

import com.profsoyuz.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByDateTimeAsc();

    List<Event> findByDateTimeAfter(LocalDateTime date);
    List<Event> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Event> findByDateTimeAfterOrderByDateTimeAsc(LocalDateTime now);


    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event.id = :eventId")
    long countParticipantsByEventId(@Param("eventId") Long eventId);
}
