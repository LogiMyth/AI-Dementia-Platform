package in.sih.dementia.patient;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "companion_messages")
public class CompanionMessage {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "user_message", nullable = false, columnDefinition = "TEXT")
    private String userMessage;

    @Column(name = "response_text", nullable = false, columnDefinition = "TEXT")
    private String responseText;

    @Column(name = "escalation_suggested", nullable = false)
    private boolean escalationSuggested;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CompanionMessage() {}

    public CompanionMessage(UUID id, UUID patientId, String userMessage, String responseText, boolean escalationSuggested) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.userMessage = userMessage;
        this.responseText = responseText;
        this.escalationSuggested = escalationSuggested;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public String getUserMessage() { return userMessage; }
    public String getResponseText() { return responseText; }
    public boolean isEscalationSuggested() { return escalationSuggested; }
    public Instant getCreatedAt() { return createdAt; }
}
