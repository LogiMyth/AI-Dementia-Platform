package in.sih.dementia.patient;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "routine_tasks")
public class RoutineTask {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private String title;

    private String cue;

    @Column(name = "scheduled_time", nullable = false)
    private String scheduledTime;

    @Column(nullable = false)
    private String recurrence;

    @Column(nullable = false)
    private String status;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected RoutineTask() {}

    public RoutineTask(UUID id, UUID patientId, String title, String cue, String scheduledTime, String recurrence) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.title = title;
        this.cue = cue;
        this.scheduledTime = scheduledTime;
        this.recurrence = recurrence != null ? recurrence : "DAILY";
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public String getTitle() { return title; }
    public String getCue() { return cue; }
    public String getScheduledTime() { return scheduledTime; }
    public String getRecurrence() { return recurrence; }
    public String getStatus() { return status; }
    public void setStatus(String status) {
        this.status = status;
        if ("COMPLETED".equals(status)) {
            this.completedAt = Instant.now();
        }
    }
    public Instant getCompletedAt() { return completedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
