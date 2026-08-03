package com.profsoyuz.controller;


import com.profsoyuz.model.AuthRequest;
import com.profsoyuz.model.AuthResponse;
import com.profsoyuz.model.ChangePasswordRequest;
import com.profsoyuz.model.RegisterRequest;
import com.profsoyuz.service.AuthService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // ============================================
    // КОНСТРУКТОР
    // ============================================

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ============================================
    // РЕГИСТРАЦИЯ (ТОЛЬКО ДЛЯ ADMIN/BOSS)
    // ============================================

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN', 'BOSS')")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // ============================================
    // ЛОГИН (ДОСТУПЕН ВСЕМ)
    // ============================================

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    // ============================================
    // СМЕНА ПАРОЛЯ (ДОСТУПЕН ВСЕМ АВТОРИЗОВАННЫМ)
    // ============================================

    @PostMapping("/change-password")
    public AuthResponse changePassword(@RequestBody ChangePasswordRequest request,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        return authService.changePassword(request, userDetails.getUsername());
    }
}
