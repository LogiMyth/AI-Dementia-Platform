package in.sih.dementia.caregiver;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_insights")
public class AIInsight {
    @Id
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    @Column(name = "contributing_signals", nullable = false, columnDefinition = "TEXT")
    private String contributingSignals;

    @Column(name = "recommended_action", nullable = false, columnDefinition = "TEXT")
    private String recommendedAction;

    @Column(nullable = false)
    private String provider;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AIInsight() {}

    public AIInsight(UUID id, UUID patientId, String summary, String riskLevel,
                     String contributingSignals, String recommendedAction, String provider) {
        this.id = id != null ? id : UUID.randomUUID();
        this.patientId = patientId;
        this.summary = summary;
        this.riskLevel = riskLevel != null ? riskLevel.toUpperCase() : "LOW";
        this.contributingSignals = contributingSignals != null ? contributingSignals : "[]";
        this.recommendedAction = recommendedAction;
        this.provider = provider != null ? provider : "deterministic-rules";
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPatientId() { return patientId; }
    public String getSummary() { return summary; }
    public String getRiskLevel() { return riskLevel; }
    public String getContributingSignals() { return contributingSignals; }
    public String getRecommendedAction() { return recommendedAction; }
    public String getProvider() { return provider; }
    public Instant getCreatedAt() { return createdAt; }
}
