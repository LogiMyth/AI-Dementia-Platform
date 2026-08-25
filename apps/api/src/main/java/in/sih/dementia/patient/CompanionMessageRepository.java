package in.sih.dementia.patient;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanionMessageRepository extends JpaRepository<CompanionMessage, UUID> {
    List<CompanionMessage> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
