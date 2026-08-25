package in.sih.dementia.patient;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "patient_profiles")
public class PatientProfile {
    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "preferred_name", nullable = false)
    private String preferredName;

    @Column(name = "preferred_language", nullable = false)
    private String preferredLanguage;

    @Column(name = "accessibility_preferences", nullable = false)
    private String accessibilityPreferences;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "consent_status", nullable = false)
    private String consentStatus;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected PatientProfile() {}

    public PatientProfile(UUID id, UUID userId, String preferredName, String preferredLanguage,
                          String accessibilityPreferences, String emergencyContact, String consentStatus) {
        this.id = id;
        this.userId = userId;
        this.preferredName = preferredName;
        this.preferredLanguage = preferredLanguage != null ? preferredLanguage : "en";
        this.accessibilityPreferences = accessibilityPreferences != null ? accessibilityPreferences : "{}";
        this.emergencyContact = emergencyContact;
        this.consentStatus = consentStatus != null ? consentStatus : "GRANTED";
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getPreferredName() { return preferredName; }
    public void setPreferredName(String preferredName) { this.preferredName = preferredName; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getAccessibilityPreferences() { return accessibilityPreferences; }
    public void setAccessibilityPreferences(String accessibilityPreferences) { this.accessibilityPreferences = accessibilityPreferences; }
    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
    public String getConsentStatus() { return consentStatus; }
    public Instant getCreatedAt() { return createdAt; }
}
