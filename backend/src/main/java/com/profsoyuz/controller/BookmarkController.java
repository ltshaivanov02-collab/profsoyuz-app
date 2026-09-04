package com.profsoyuz.controller;

import com.profsoyuz.dto.BookmarkDto;
import com.profsoyuz.model.User;
import com.profsoyuz.service.BookmarkService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    // ============================================
    // ПОЛУЧИТЬ ВСЕ ЗАКЛАДКИ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
    // ============================================

    @GetMapping
    public List<BookmarkDto> getMyBookmarks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return bookmarkService.getUserBookmarksDto(user.getId());
    }
}
