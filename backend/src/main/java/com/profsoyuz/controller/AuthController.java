package com.profsoyuz.controller;

import com.profsoyuz.dto.AuthRequest;
import com.profsoyuz.dto.AuthResponse;
import com.profsoyuz.dto.ChangePasswordRequest;
import com.profsoyuz.dto.RegisterRequest;
import com.profsoyuz.service.AuthService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/change-password")
    public AuthResponse changePassword(@RequestBody ChangePasswordRequest request,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return new AuthResponse(null, "User not authenticated");
        }
        return authService.changePassword(request, userDetails.getUsername());
    }
}
