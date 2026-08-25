package in.sih.dementia.caregiver;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "caregiver_patient_links")
public class CaregiverPatientLink {
    @Id
    private UUID id;

    @Column(name = "caregiver_id", nullable = false)
    private UUID caregiverId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "relationship_label")
    private String relationshipLabel;

    @Column(nullable = false)
    private String permissions;

    @Column(nullable = false)
    private boolean active;

    protected CaregiverPatientLink() {}

    public CaregiverPatientLink(UUID id, UUID caregiverId, UUID patientId, String relationshipLabel, String permissions, boolean active) {
        this.id = id != null ? id : UUID.randomUUID();
        this.caregiverId = caregiverId;
        this.patientId = patientId;
        this.relationshipLabel = relationshipLabel;
        this.permissions = permissions != null ? permissions : "{}";
        this.active = active;
    }

    public UUID getId() { return id; }
    public UUID getCaregiverId() { return caregiverId; }
    public UUID getPatientId() { return patientId; }
    public String getRelationshipLabel() { return relationshipLabel; }
    public String getPermissions() { return permissions; }
    public boolean isActive() { return active; }
}
