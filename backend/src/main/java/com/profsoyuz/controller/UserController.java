package com.profsoyuz.controller;

import com.profsoyuz.dto.UserDto;
import com.profsoyuz.model.User;
import com.profsoyuz.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Value("${app.upload.dir:uploads/avatars/}")
    private String uploadDir;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ============================================
    // ПРОФИЛЬ
    // ============================================

    @GetMapping("/profile")
    public UserDto getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return convertToDto(user);
    }

    @PutMapping("/profile")
    public UserDto updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                 @RequestBody UserDto userDto) {
        User user = (User) userDetails;
        user.setFullName(userDto.getFullName());
        user.setPhotoUrl(userDto.getPhotoUrl());
        userService.save(user);
        return convertToDto(user);
    }

    // ============================================
    // ФОТО ПРОФИЛЯ
    // ============================================

    @PostMapping("/profile/photo")
    public UserDto uploadPhoto(@RequestParam("file") MultipartFile file,
                               @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User user = (User) userDetails;

        // 1. Проверяем, что файл передан
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // 2. Генерируем уникальное имя файла
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;

        // 3. Создаём папку, если её нет
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 4. Сохраняем файл
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());

        // 5. Сохраняем ссылку в БД
        String photoUrl = "/uploads/avatars/" + fileName;
        user.setPhotoUrl(photoUrl);
        userService.save(user);

        return convertToDto(user);
    }

    @DeleteMapping("/profile/photo")
    public UserDto deletePhoto(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        // 1. Проверяем, есть ли фото
        if (user.getPhotoUrl() != null) {
            // 2. Получаем путь к файлу
            String filePath = user.getPhotoUrl().replace("/uploads/", "");
            File file = new File(filePath);
            // 3. Удаляем файл, если он существует
            if (file.exists()) {
                file.delete();
            }
            // 4. Удаляем ссылку из БД
            user.setPhotoUrl(null);
            userService.save(user);
        }

        return convertToDto(user);
    }

    // ============================================
    // ПРЕОБРАЗОВАНИЕ ENTITY → DTO
    // ============================================

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setRole(user.getRole());
        dto.setFirstLogin(user.isFirstLogin());
        return dto;
    }
}
