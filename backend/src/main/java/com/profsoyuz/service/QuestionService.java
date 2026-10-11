package com.profsoyuz.service;

import com.profsoyuz.dto.QuestionResponse;
import com.profsoyuz.exception.ResourceNotFoundException;
import com.profsoyuz.model.Question;
import com.profsoyuz.model.QuestionStatus;
import com.profsoyuz.model.User;
import com.profsoyuz.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service  // ← ДОБАВЛЕНО!
public class QuestionService {  // ← исправлено (без 's')

    private final QuestionRepository questionRepository;
    private final NotificationService notificationService;

    public QuestionService(QuestionRepository questionRepository, NotificationService notificationService) {
        this.notificationService = notificationService;
        this.questionRepository = questionRepository;
    }



    public List<QuestionResponse> getAllQuestions() {
        return questionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionResponse> getQuestionsByStatus(QuestionStatus status) {
        return questionRepository.findByStatus(status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionResponse> getQuestionsByUser(Long userId) {
        return questionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id));
    }

    @Transactional
    public Question createQuestion(User user, String text) {
        Question question = new Question();
        question.setUser(user);
        question.setText(text);
        question.setStatus(QuestionStatus.PENDING);
        question.setCreatedAt(LocalDateTime.now());

        Question saved = questionRepository.save(question);

        // ✅ УВЕДОМЛЕНИЕ ВСЕМ ADMIN/BOSS
        String preview = text.length() > 50 ? text.substring(0, 50) + "..." : text;
        notificationService.createNotificationForAdmins(
                "question",
                "❓ Новый вопрос",
                (user.getFullName() != null ? user.getFullName() : user.getUsername()) + ": " + preview,
                "admin.html"
        );

        return saved;
    }

    @Transactional
    public Question answerQuestion(Long questionId, String answer, User admin) {
        Question question = getQuestionById(questionId);

        question.setAdminAnswer(answer);
        question.setAdmin(admin);
        question.setStatus(QuestionStatus.ANSWERED);
        question.setAnsweredAt(LocalDateTime.now());

        Question saved = questionRepository.save(question);

        // ✅ УВЕДОМЛЕНИЕ АВТОРУ
        notificationService.createNotification(
                question.getUser().getId(),
                "question",
                "💬 Ответ на ваш вопрос",
                "Администратор ответил на ваш вопрос: \"" +
                        (question.getText().length() > 50 ? question.getText().substring(0, 50) + "..." : question.getText()) + "\"",
                "profile.html"
        );

        return saved;
    }

    public QuestionResponse convertToResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setText(question.getText());
        response.setAdminAnswer(question.getAdminAnswer());
        response.setStatus(question.getStatus());
        response.setUserName(question.getUser() != null ? question.getUser().getFullName() : "Unknown");
        response.setAdminName(question.getAdmin() != null ? question.getAdmin().getFullName() : null);
        response.setCreatedAt(question.getCreatedAt());
        response.setAnsweredAt(question.getAnsweredAt());

        return response;
    }
}
