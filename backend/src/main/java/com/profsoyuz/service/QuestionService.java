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

    public QuestionService(QuestionRepository questionRepository) {
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

        return questionRepository.save(question);
    }

    @Transactional
    public Question answerQuestion(Long questionId, String answer, User admin) {  // ← исправлено
        Question question = getQuestionById(questionId);  // ← исправлено
        question.setAdminAnswer(answer);
        question.setAdmin(admin);
        question.setStatus(QuestionStatus.ANSWERED);
        question.setAnsweredAt(LocalDateTime.now());

        return questionRepository.save(question);
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
