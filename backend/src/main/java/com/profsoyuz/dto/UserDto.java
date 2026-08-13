package com.profsoyuz.dto;
import com.profsoyuz.model.Role;

public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String photoUrl;
    private Role role;
    private boolean firstLogin;

    public UserDto() {
    }

    public UserDto(Long id,
                   String username,
                   String fullName,
                   String email,
                   String photoUrl,
                   Role role,
                   boolean firstLogin) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.photoUrl = photoUrl;
        this.role = role;
        this.firstLogin = firstLogin;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isFirstLogin() {
        return firstLogin;
    }

    public void setFirstLogin(boolean firstLogin) {
        this.firstLogin = firstLogin;
    }
}
