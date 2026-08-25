package in.sih.dementia.patient;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "check_ins")
public class CheckIn {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private String mood;

    @Column(name = "sleep_quality", nullable = false)
    private String sleepQuality;

    @Column(name = "orientation_response")
    private String orientationResponse;

    @Column(name = "help_requested", nullable = false)
    private boolean helpRequested;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    protected CheckIn() {}

    public CheckIn(UUID id, UUID patientId, String mood, String sleepQuality,
                   String orientationResponse, boolean helpRequested) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.mood = mood;
        this.sleepQuality = sleepQuality;
        this.orientationResponse = orientationResponse;
        this.helpRequested = helpRequested;
        this.submittedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public String getMood() { return mood; }
    public String getSleepQuality() { return sleepQuality; }
    public String getOrientationResponse() { return orientationResponse; }
    public boolean isHelpRequested() { return helpRequested; }
    public Instant getSubmittedAt() { return submittedAt; }
}
