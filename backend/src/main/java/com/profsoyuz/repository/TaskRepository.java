package com.profsoyuz.repository;

import com.profsoyuz.model.Task;
import com.profsoyuz.model.TaskStatus;
import com.profsoyuz.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedTo(User user);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByCreatedBy(User user);

    List<Task> findByAssignedToAndStatus(User user, TaskStatus status);


    long countByStatus(TaskStatus status);
}

