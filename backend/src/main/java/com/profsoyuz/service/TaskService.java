package com.profsoyuz.service;

import com.profsoyuz.dto.TaskDto;
import com.profsoyuz.model.Task;
import com.profsoyuz.model.TaskStatus;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskDto> getAllTasksDto() {
        return taskRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TaskDto getTaskDtoById(Long id) {
        return convertToDto(getTaskById(id));
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> getTasksByAssignedTo(User user) {
        return taskRepository.findByAssignedTo(user);
    }

    @Transactional
    public Task createTask(String title, String description, User assignedTo, User createdBy) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setAssignedTo(assignedTo);
        task.setCreatedBy(createdBy);
        task.setStatus(TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTaskStatus(Long id, TaskStatus status) {
        Task task = getTaskById(id);
        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Long id, String title, String description, User assignedTo) {
        Task task = getTaskById(id);
        task.setTitle(title);
        task.setDescription(description);
        task.setAssignedTo(assignedTo);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public long countByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status).size();
    }

    public TaskDto convertToDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null,
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null,
                task.getCreatedBy() != null ? task.getCreatedBy().getFullName() : null,
                task.getCreatedBy() != null ? task.getCreatedBy().getId() : null,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}

