package in.sih.dementia.patient;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "memory_items")
public class MemoryItem {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String cue;

    @Column(name = "image_emoji", nullable = false)
    private String imageEmoji;

    @Column(name = "relationship_tag")
    private String relationshipTag;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected MemoryItem() {}

    public MemoryItem(UUID id, UUID patientId, String title, String cue,
                      String imageEmoji, String relationshipTag, String mediaUrl) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.title = title;
        this.cue = cue;
        this.imageEmoji = imageEmoji != null ? imageEmoji : "📸";
        this.relationshipTag = relationshipTag;
        this.mediaUrl = mediaUrl;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public String getTitle() { return title; }
    public String getCue() { return cue; }
    public String getImageEmoji() { return imageEmoji; }
    public String getRelationshipTag() { return relationshipTag; }
    public String getMediaUrl() { return mediaUrl; }
    public Instant getCreatedAt() { return createdAt; }
}
