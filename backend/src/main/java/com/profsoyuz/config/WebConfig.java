package com.profsoyuz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Раздача загруженных аватаров
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations("file:uploads/avatars/");

        // Раздача загруженных изображений для событий
        registry.addResourceHandler("/uploads/events/**")
                .addResourceLocations("file:uploads/events/");

        // Раздача загруженных изображений для новостей
        registry.addResourceHandler("/uploads/news/**")
                .addResourceLocations("file:uploads/news/");
    }
}