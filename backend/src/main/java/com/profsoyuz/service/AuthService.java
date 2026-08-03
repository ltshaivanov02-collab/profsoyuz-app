package com.profsoyuz.service;

import com.profsoyuz.model.*;
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

    // ============================================
    // КОНСТРУКТОР
    // ============================================

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
    // РЕГИСТРАЦИЯ (ТОЛЬКО ДЛЯ АДМИНА/РУКОВОДИТЕЛЯ)
    // ============================================

    public AuthResponse register(RegisterRequest request) {

        // 1. Проверяем, свободен ли логин
        if (userService.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, "Username already exists");
        }

        // 2. Проверяем, свободен ли email
        if (userService.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, "Email already exists");
        }

        // 3. Проверяем, передана ли роль
        if (request.getRole() == null) {
            return new AuthResponse(null, "Role is required");
        }

        // 4. Создаём нового пользователя
        User user = new User();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());  // ← Роль из запроса
        user.setFirstLogin(true);          // ← При первом входе сменить пароль

        // 5. Сохраняем в БД
        userService.save(user);

        // 6. Генерируем токен
        String token = jwtService.generateToken(user);

        // 7. Возвращаем ответ
        return new AuthResponse(token, "User created successfully. First login required - please change password.");
    }

    // ============================================
    // ЛОГИН
    // ============================================

    public AuthResponse login(AuthRequest request) {

        // 1. Проверяем логин и пароль
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Загружаем пользователя из БД
        User user = (User) userService.loadUserByUsername(request.getUsername());

        // 3. Проверяем, первый ли это вход
        boolean isFirstLogin = user.isFirstLogin();

        // 4. Генерируем токен
        String token = jwtService.generateToken(user);

        // 5. Возвращаем ответ с предупреждением, если первый вход
        String message = isFirstLogin
                ? "First login - please change your password"
                : "Login successful";

        return new AuthResponse(token, message);
    }

    // ============================================
    // СМЕНА ПАРОЛЯ
    // ============================================

    public AuthResponse changePassword(ChangePasswordRequest request, String username) {

        // 1. Загружаем пользователя из БД
        User user = (User) userService.loadUserByUsername(username);

        // 2. Проверяем старый пароль
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return new AuthResponse(null, "Old password is incorrect");
        }

        // 3. Проверяем, совпадают ли новый пароль и подтверждение
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse(null, "Passwords do not match");
        }

        // 4. Проверяем минимальную длину пароля (6 символов)
        if (request.getNewPassword().length() < 6) {
            return new AuthResponse(null, "Password must be at least 6 characters");
        }

        // 5. Меняем пароль
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);  // ← Снимаем флаг первого входа

        // 6. Сохраняем пользователя
        userService.save(user);

        // 7. Генерируем новый токен
        String token = jwtService.generateToken(user);

        // 8. Возвращаем ответ
        return new AuthResponse(token, "Password changed successfully");
    }
}
