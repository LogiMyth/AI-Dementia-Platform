package in.sih.dementia.patient;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "medication_schedules")
public class MedicationSchedule {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "medication_label", nullable = false)
    private String medicationLabel;

    @Column(name = "dosage_text", nullable = false)
    private String dosageText;

    @Column(name = "scheduled_time", nullable = false)
    private String scheduledTime;

    private String instructions;

    @Column(name = "missed_threshold", nullable = false)
    private int missedThreshold;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected MedicationSchedule() {}

    public MedicationSchedule(UUID id, UUID patientId, String medicationLabel, String dosageText,
                              String scheduledTime, String instructions, int missedThreshold) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.medicationLabel = medicationLabel;
        this.dosageText = dosageText;
        this.scheduledTime = scheduledTime;
        this.instructions = instructions;
        this.missedThreshold = missedThreshold > 0 ? missedThreshold : 2;
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public String getMedicationLabel() { return medicationLabel; }
    public String getDosageText() { return dosageText; }
    public String getScheduledTime() { return scheduledTime; }
    public String getInstructions() { return instructions; }
    public int getMissedThreshold() { return missedThreshold; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
