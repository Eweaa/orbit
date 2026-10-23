package com.orbit.google;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
public class CalendarController {

    private final GoogleAuthService authService;
    private final GoogleCalendarService calendarService;

    public CalendarController(GoogleAuthService authService,
                              GoogleCalendarService calendarService) {
        this.authService = authService;
        this.calendarService = calendarService;
    }

    @GetMapping("/calendar/status")
    public Map<String, Boolean> status(@AuthenticationPrincipal Long userId) {
        return Map.of("linked", authService.isLinked(userId));
    }

    @GetMapping("/calendar/events")
    public ResponseEntity<?> events(@AuthenticationPrincipal Long userId) throws Exception {
        if (!authService.isLinked(userId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "not_linked"));
        }
        try {
            return ResponseEntity.ok(calendarService.getUpcomingEvents(userId));
        } catch (IOException e) {
            // If Google rejected the refresh, the link was deleted: report "not linked"
            if (!authService.isLinked(userId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "not_linked"));
            }
            throw e;
        }
    }
}