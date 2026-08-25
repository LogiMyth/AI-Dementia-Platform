package in.sih.dementia.caregiver;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<Alert> findByPatientIdAndStatusOrderByCreatedAtDesc(UUID patientId, String status);
    long countByPatientIdAndStatus(UUID patientId, String status);
}
