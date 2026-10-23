package com.orbit.google;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.util.Map;

@RestController
public class GoogleAuthController {

    private final GoogleAuthService authService;

    public GoogleAuthController(GoogleAuthService authService) {
        this.authService = authService;
    }

    // Requires login. @AuthenticationPrincipal is the user id our JWT filter set.
    @GetMapping("/calendar/link-url")
    public Map<String, String> linkUrl(@AuthenticationPrincipal Long userId) {
        return Map.of("url", authService.buildAuthorizationUrl(userId));
    }

    // Public: Google sends the browser here. "state" tells us which user it was.
    @GetMapping("/oauth/callback")
    public ResponseEntity<Void> callback(@RequestParam(required = false) String code,
                                         @RequestParam(required = false) String error,
                                         @RequestParam(required = false) String state) throws IOException {
        Long userId = authService.consumeState(state);
        String target = "http://localhost:4200/calendar-linked";
        if (error != null || code == null || userId == null) {
            target += "?error=true";
        } else {
            authService.handleCallback(code, userId);
        }
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }
}