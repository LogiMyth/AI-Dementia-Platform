package in.sih.dementia.caregiver;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "caregiver_notes")
public class CaregiverNote {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "caregiver_id", nullable = false)
    private UUID caregiverId;

    @Column(name = "note_text", nullable = false, columnDefinition = "TEXT")
    private String noteText;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CaregiverNote() {}

    public CaregiverNote(UUID id, UUID patientId, UUID caregiverId, String noteText) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.caregiverId = caregiverId;
        this.noteText = noteText;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public UUID getCaregiverId() { return caregiverId; }
    public String getNoteText() { return noteText; }
    public Instant getCreatedAt() { return createdAt; }
}
