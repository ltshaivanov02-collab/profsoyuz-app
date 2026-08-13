package com.profsoyuz.repository;

import com.profsoyuz.model.Application;
import com.profsoyuz.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Application> findByStatus(ApplicationStatus status);
    List<Application> findAllByOrderByCreatedAtDesc();
    long countByStatus(ApplicationStatus status);
    List<Application> findByUserIdAndStatus(Long userId, ApplicationStatus status);

}
