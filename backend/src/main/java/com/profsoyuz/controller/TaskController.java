package com.profsoyuz.controller;

import com.profsoyuz.dto.TaskDto;
import com.profsoyuz.model.Task;
import com.profsoyuz.model.TaskStatus;
import com.profsoyuz.model.User;
import com.profsoyuz.service.TaskService;
import com.profsoyuz.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;         // ✅ ДОБАВЛЕНО
import java.util.List;

@RestController
@RequestMapping("/api/admin/tasks")
@PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @GetMapping
    public List<TaskDto> getAllTasks() {
        return taskService.getAllTasksDto();
    }

    @GetMapping("/{id}")
    public TaskDto getTaskById(@PathVariable Long id) {
        return taskService.getTaskDtoById(id);
    }

    // ✅ ИСПРАВЛЕНО: передаём assignedToId (Long) и deadline
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public TaskDto createTask(@RequestBody CreateTaskRequest request,
                              @AuthenticationPrincipal UserDetails userDetails) {
        User createdBy = (User) userDetails;

        return taskService.createTask(
                request.getTitle(),
                request.getDescription(),
                request.getAssignedToId(),      // ✅ Long
                request.getDeadline(),          // ✅ LocalDateTime
                createdBy
        );
    }

    @PatchMapping("/{id}/status")
    public TaskDto updateTaskStatus(@PathVariable Long id,
                                    @RequestParam TaskStatus status) {
        Task task = taskService.updateTaskStatus(id, status);
        return taskService.convertToDto(task);
    }

    @PutMapping("/{id}")
    public TaskDto updateTask(@PathVariable Long id,
                              @RequestBody UpdateTaskRequest request) {
        User assignedTo = request.getAssignedToId() != null
                ? userService.getUserById(request.getAssignedToId())
                : null;
        Task task = taskService.updateTask(
                id,
                request.getTitle(),
                request.getDescription(),
                assignedTo
        );
        return taskService.convertToDto(task);
    }

    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return "Task deleted successfully";
    }

    @GetMapping("/status/{status}")
    public List<Task> getTasksByStatus(@PathVariable TaskStatus status) {
        return taskService.getTasksByStatus(status);
    }

    // ============================================
    // ВНУТРЕННИЕ DTO
    // ============================================

    public static class CreateTaskRequest {
        private String title;
        private String description;
        private Long assignedToId;
        private LocalDateTime deadline;         // ✅ НОВОЕ ПОЛЕ

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

        public LocalDateTime getDeadline() { return deadline; }              // ✅
        public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }  // ✅
    }

    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private Long assignedToId;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

        // ✅ УБРАНО: getDeadline() и setDeadline() — они были в неправильном классе!
    }
}

