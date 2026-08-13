package com.profsoyuz.exception;

public class ResourceNotFoundException extends RuntimeException{

    public ResourceNotFoundException(String messege) {
        super(messege);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }

}
