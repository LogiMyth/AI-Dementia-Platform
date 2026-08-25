package in.sih.dementia.caregiver;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AIInsightRepository extends JpaRepository<AIInsight, UUID> {
    Optional<AIInsight> findTop1ByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<AIInsight> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
