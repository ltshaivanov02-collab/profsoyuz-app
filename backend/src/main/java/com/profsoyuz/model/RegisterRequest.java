package com.profsoyuz.model;

public class RegisterRequest {

    private String username;
    private String fullName;
    private String email;
    private String password;
    private Role role;  // ← НОВОЕ ПОЛЕ! Администратор передаёт роль

    // ============================================
    // КОНСТРУКТОРЫ
    // ============================================

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String fullName, String email, String password, Role role) {
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // ============================================
    // ГЕТТЕРЫ И СЕТТЕРЫ
    // ============================================

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

