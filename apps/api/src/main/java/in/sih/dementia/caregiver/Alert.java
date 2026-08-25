package in.sih.dementia.caregiver;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alerts")
public class Alert {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rationale;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "acknowledged_by")
    private UUID acknowledgedBy;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    protected Alert() {}

    public Alert(UUID id, UUID patientId, String severity, String type, String status, String rationale) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.severity = severity != null ? severity.toUpperCase() : "MEDIUM";
        this.type = type;
        this.status = status != null ? status.toUpperCase() : "ACTIVE";
        this.rationale = rationale;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public String getSeverity() { return severity; }
    public String getType() { return type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRationale() { return rationale; }
    public Instant getCreatedAt() { return createdAt; }
    public UUID getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(UUID acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
