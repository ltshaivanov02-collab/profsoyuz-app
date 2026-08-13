package com.profsoyuz.repository;

import com.profsoyuz.model.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

public interface NewsRepository extends JpaRepository<News,Long> {
    List<News> findAllByOrderByCreatedAtDesc();
}
