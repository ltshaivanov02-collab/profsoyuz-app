package com.profsoyuz.controller;

import com.profsoyuz.dto.QuestionResponse;
import com.profsoyuz.model.Question;
import com.profsoyuz.model.User;
import com.profsoyuz.service.QuestionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // ============================================
    // ПОЛУЧИТЬ ВСЕ ВОПРОСЫ
    // ============================================

    @GetMapping
    public List<QuestionResponse> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    // ============================================
    // ПОЛУЧИТЬ МОИ ВОПРОСЫ
    // ============================================

    @GetMapping("/my")
    public List<QuestionResponse> getMyQuestions(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return questionService.getQuestionsByUser(user.getId());
    }

    // ============================================
    // СОЗДАТЬ ВОПРОС
    // ============================================

    @PostMapping
    public QuestionResponse createQuestion(@RequestBody CreateQuestionRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        Question question = questionService.createQuestion(user, request.getText());
        return questionService.convertToResponse(question);
    }

    // ============================================
    // ОТВЕТИТЬ НА ВОПРОС (ADMIN/BOSS)
    // ============================================

    @PutMapping("/{id:\\d+}/answer")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public QuestionResponse answerQuestion(@PathVariable Long id,
                                           @RequestBody AnswerRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User admin = (User) userDetails;
        Question question = questionService.answerQuestion(id, request.getAnswer(), admin);
        return questionService.convertToResponse(question);
    }

    // ============================================
    // DTO
    // ============================================

    public static class CreateQuestionRequest {
        private String text;
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class AnswerRequest {
        private String answer;
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }
}
