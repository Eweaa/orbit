package com.orbit.auth;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users") // "user" is a reserved word in Postgres, so we use "users"
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // Nullable on purpose: a Google-only user wouldn't have a password later
    private String passwordHash;

    private Instant createdAt = Instant.now();

    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Instant getCreatedAt() { return createdAt; }
}