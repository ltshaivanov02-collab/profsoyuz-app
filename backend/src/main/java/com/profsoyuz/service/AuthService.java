package com.profsoyuz.service;

import com.profsoyuz.dto.AuthRequest;
import com.profsoyuz.dto.AuthResponse;
import com.profsoyuz.dto.ChangePasswordRequest;
import com.profsoyuz.dto.RegisterRequest;
import com.profsoyuz.model.User;
import com.profsoyuz.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserService userService,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // ============================================
    // РЕГИСТРАЦИЯ
    // ============================================

    public AuthResponse register(RegisterRequest request) {

        if (userService.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, "Username already exists");
        }

        if (userService.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, "Email already exists");
        }

        if (request.getRole() == null) {
            return new AuthResponse(null, "Role is required");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFirstLogin(false);  // ← Пароль не нужно менять сразу

        userService.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, "User created successfully");
    }

    // ============================================
    // ЛОГИН
    // ============================================

    public AuthResponse login(AuthRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = (User) userService.loadUserByUsername(request.getUsername());

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, "Login successful");
    }

    // ============================================
    // СМЕНА ПАРОЛЯ (РАБОТАЕТ В ЛЮБОЕ ВРЕМЯ)
    // ============================================

    public AuthResponse changePassword(ChangePasswordRequest request, String username) {

        User user = (User) userService.loadUserByUsername(username);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return new AuthResponse(null, "Old password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse(null, "Passwords do not match");
        }

        if (request.getNewPassword().length() < 6) {
            return new AuthResponse(null, "Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);

        userService.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, "Password changed successfully");
    }
}
