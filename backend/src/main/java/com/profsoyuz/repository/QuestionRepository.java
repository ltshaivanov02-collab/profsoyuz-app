package com.profsoyuz.repository;

import com.profsoyuz.model.Question;
import com.profsoyuz.model.QuestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Question> findByStatus(QuestionStatus status);
    List<Question> findAllByOrderByCreatedAtDesc();
    List<Question> findByUserIdAndStatus(Long userId, QuestionStatus status);
    long countByStatus(QuestionStatus status);

}
