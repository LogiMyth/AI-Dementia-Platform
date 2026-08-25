package in.sih.dementia.caregiver;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaregiverPatientLinkRepository extends JpaRepository<CaregiverPatientLink, UUID> {
    List<CaregiverPatientLink> findByCaregiverIdAndActiveTrue(UUID caregiverId);
}
