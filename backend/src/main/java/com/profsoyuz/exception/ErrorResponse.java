package com.profsoyuz.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private String messege;
    private int status;
    private String error;
    private String path;
    private LocalDateTime timestamp;

    public ErrorResponse() {
    }

    public ErrorResponse(String messege, int status,
                         String error,
                         String path
                         ) {
        this.messege = messege;
        this.status = status;
        this.error = error;
        this.path = path;
        this.timestamp = timestamp;
    }

    public String getMessege() {
        return messege;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getPath() {
        return path;
    }

    public void setMessege(String messege) {
        this.messege = messege;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public void setError(String error) {
        this.error = error;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
