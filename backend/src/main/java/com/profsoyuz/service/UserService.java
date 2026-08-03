package com.profsoyuz.service;

import com.profsoyuz.model.User;
import com.profsoyuz.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    // ============================================
    // КОНСТРУКТОР
    // ============================================

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ============================================
    // ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ ДЛЯ SPRING SECURITY
    // ============================================

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    // ============================================
    // СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЯ
    // ============================================

    public User save(User user) {
        return userRepository.save(user);
    }

    // ============================================
    // ПРОВЕРКА СУЩЕСТВОВАНИЯ ПОЛЬЗОВАТЕЛЯ
    // ============================================

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
