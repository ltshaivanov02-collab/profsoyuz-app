package com.profsoyuz.controller;

import com.profsoyuz.dto.UserDto;
import com.profsoyuz.model.User;
import com.profsoyuz.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
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
    // ФОТО ПРОФИЛЯ - ЗАГРУЗКА ЧЕРЕЗ MULTIPART FILE
    // ============================================

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;

            // 1. Проверка на пустой файл
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }

            // 2. Проверка размера (макс 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "File size exceeds 5MB limit"));
            }

            // 3. Проверка типа файла
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed"));
            }

            // 4. Удаляем старое фото
            if (user.getPhotoUrl() != null && !user.getPhotoUrl().isEmpty()) {
                String oldFilePath = user.getPhotoUrl().replace("/uploads/avatars/", "");
                File oldFile = new File(uploadDir + oldFilePath);
                if (oldFile.exists()) {
                    oldFile.delete();
                }
            }

            // 5. Генерируем уникальное имя файла
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + extension;

            // 6. Создаём папку, если её нет
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 7. Сохраняем файл
            Path filePath = Paths.get(uploadDir + fileName);
            Files.write(filePath, file.getBytes());

            // 8. Сохраняем ссылку в БД
            String photoUrl = "/uploads/avatars/" + fileName;
            user.setPhotoUrl(photoUrl);
            userService.save(user);

            return ResponseEntity.ok(convertToDto(user));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to upload file: " + e.getMessage()));
        }
    }

    // ============================================
    // ФОТО ПРОФИЛЯ - ОБНОВЛЕНИЕ ЧЕРЕЗ BASE64
    // ============================================

    @PutMapping("/profile/photo")
    public ResponseEntity<?> updatePhotoBase64(@RequestBody Map<String, String> request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        String photoUrl = request.get("photoUrl");

        if (photoUrl == null || photoUrl.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "photoUrl is required"));
        }

        // Если приходит Base64, сохраняем как есть
        user.setPhotoUrl(photoUrl);
        userService.save(user);

        return ResponseEntity.ok(convertToDto(user));
    }

    // ============================================
    // ФОТО ПРОФИЛЯ - УДАЛЕНИЕ
    // ============================================

    @DeleteMapping("/profile/photo")
    public ResponseEntity<?> deletePhoto(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;

        if (user.getPhotoUrl() != null && !user.getPhotoUrl().isEmpty()) {
            // Удаляем файл, если это не Base64 (т.е. если это путь к файлу)
            if (!user.getPhotoUrl().startsWith("data:image")) {
                String filePath = user.getPhotoUrl().replace("/uploads/avatars/", "");
                File file = new File(uploadDir + filePath);
                if (file.exists()) {
                    file.delete();
                }
            }
            user.setPhotoUrl(null);
            userService.save(user);
        }

        return ResponseEntity.ok(convertToDto(user));
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
