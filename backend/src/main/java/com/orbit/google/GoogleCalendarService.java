package com.orbit.google;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "My Spring App";

    private final GoogleAuthService authService;

    public GoogleCalendarService(GoogleAuthService authService) {
        this.authService = authService;
    }

    // Like a C# record: a small immutable data class that becomes JSON
    public record EventDto(String id, String title, String start, String end) {}

    public List<EventDto> getUpcomingEvents(Long userId) throws IOException, GeneralSecurityException {
        Credential credential = authService.getCredential(userId);
        if (credential == null) {
            throw new IllegalStateException("Google Calendar is not linked");
        }

        NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        Calendar service = new Calendar.Builder(
                transport, GsonFactory.getDefaultInstance(), credential)
                .setApplicationName(APPLICATION_NAME)
                .build();

        List<Event> events = service.events().list("primary")
                .setMaxResults(20)
                .setTimeMin(new DateTime(System.currentTimeMillis()))
                .setOrderBy("startTime")
                .setSingleEvents(true) // expands recurring events; required for orderBy
                .execute()
                .getItems();

        return events.stream()
                .map(e -> new EventDto(
                        e.getId(),
                        e.getSummary() != null ? e.getSummary() : "(No title)",
                        format(e.getStart()),
                        format(e.getEnd())))
                .toList();
    }

    // Timed events have dateTime, all-day events only have date
    private String format(EventDateTime t) {
        if (t == null) return null;
        DateTime value = t.getDateTime() != null ? t.getDateTime() : t.getDate();
        return value != null ? value.toStringRfc3339() : null;
    }
}