package com.profsoyuz.repository;

import com.profsoyuz.model.NewsComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsCommentRepository extends JpaRepository<NewsComment, Long> {

    List<NewsComment> findByNewsIdOrderByCreatedAtDesc(Long newsId);

    long countByNewsId(Long newsId);
}