package in.sih.dementia.patient;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckInRepository extends JpaRepository<CheckIn, UUID> {
    Optional<CheckIn> findTop1ByPatientIdOrderBySubmittedAtDesc(UUID patientId);
    List<CheckIn> findByPatientIdOrderBySubmittedAtDesc(UUID patientId);
}
