package com.orbit.google;

import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.ClientParametersAuthentication;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.CredentialRefreshListener;
import com.google.api.client.auth.oauth2.TokenErrorResponse;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GoogleAuthService {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    private final NetHttpTransport transport;
    private final GsonFactory jsonFactory = GsonFactory.getDefaultInstance();
    private final GoogleAuthorizationCodeFlow flow;
    private final GoogleTokenRepository tokenRepository;

    // Remembers "which user started this Google flow" while they're away on Google's page
    private final Map<String, Long> pendingStates = new ConcurrentHashMap<>();

    public GoogleAuthService(GoogleTokenRepository tokenRepository) throws Exception {
        this.tokenRepository = tokenRepository;
        this.transport = GoogleNetHttpTransport.newTrustedTransport();
        this.flow = new GoogleAuthorizationCodeFlow.Builder(
                transport,
                jsonFactory,
                GoogleConstants.CLIENT_ID,
                GoogleConstants.CLIENT_SECRET,
                GoogleConstants.SCOPES)
                .setAccessType("offline")
                .build();
    }

    // The random "state" ties Google's callback back to the logged-in user
    public String buildAuthorizationUrl(Long userId) {
        String state = UUID.randomUUID().toString();
        pendingStates.put(state, userId);
        return flow.newAuthorizationUrl()
                .setRedirectUri(GoogleConstants.REDIRECT_URI)
                .set("prompt", "consent")
                .setState(state)
                .build();
    }

    // Returns the user id for this state (and forgets it), or null if unknown
    public Long consumeState(String state) {
        return state == null ? null : pendingStates.remove(state);
    }

    public void handleCallback(String code, Long userId) throws IOException {
        TokenResponse tokens = flow.newTokenRequest(code).setRedirectUri(GoogleConstants.REDIRECT_URI).execute();

        GoogleToken saved = tokenRepository.findById(userId).orElseGet(GoogleToken::new);
        saved.setUserId(userId);
        saved.setAccessToken(tokens.getAccessToken());
        if (tokens.getRefreshToken() != null) {
            saved.setRefreshToken(tokens.getRefreshToken());
        }
        saved.setExpiresAtMillis(expiryFrom(tokens));
        tokenRepository.save(saved);
    }

    public boolean isLinked(Long userId) {
        return tokenRepository.existsById(userId);
    }

    public Credential getCredential(Long userId) {
        return tokenRepository.findById(userId).map(this::toCredential).orElse(null);
    }

    private Credential toCredential(GoogleToken saved) {
        Long userId = saved.getUserId();
        Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
                .setTransport(transport)
                .setJsonFactory(jsonFactory)
                .setTokenServerEncodedUrl(TOKEN_URL)
                .setClientAuthentication(new ClientParametersAuthentication(
                        GoogleConstants.CLIENT_ID, GoogleConstants.CLIENT_SECRET))
                .addRefreshListener(new CredentialRefreshListener() {
                    @Override
                    public void onTokenResponse(Credential c, TokenResponse response) {
                        tokenRepository.findById(userId).ifPresent(row -> {
                            row.setAccessToken(response.getAccessToken());
                            row.setExpiresAtMillis(expiryFrom(response));
                            tokenRepository.save(row);
                        });
                    }

                    @Override
                    public void onTokenErrorResponse(Credential c, TokenErrorResponse error) {
                        tokenRepository.deleteById(userId); // access revoked: forget the link
                    }
                })
                .build();

        credential.setAccessToken(saved.getAccessToken());
        credential.setRefreshToken(saved.getRefreshToken());
        credential.setExpirationTimeMilliseconds(saved.getExpiresAtMillis());
        return credential;
    }

    private long expiryFrom(TokenResponse tokens) {
        Long seconds = tokens.getExpiresInSeconds();
        return System.currentTimeMillis() + (seconds != null ? seconds : 3600) * 1000;
    }
}