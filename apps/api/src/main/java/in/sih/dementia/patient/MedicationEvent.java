package in.sih.dementia.patient;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "medication_events")
public class MedicationEvent {
    @Id
    private UUID id;

    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private String action;

    private String note;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected MedicationEvent() {}

    public MedicationEvent(UUID id, UUID scheduleId, UUID patientId, String action, String note) {
        this.id = id != null ? id : UUID.randomUUID();
        this.scheduleId = scheduleId;
        this.patientId = patientId;
        this.action = action;
        this.note = note;
        this.occurredAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getScheduleId() { return scheduleId; }
    public UUID getPatientId() { return patientId; }
    public String getAction() { return action; }
    public String getNote() { return note; }
    public Instant getOccurredAt() { return occurredAt; }
}
