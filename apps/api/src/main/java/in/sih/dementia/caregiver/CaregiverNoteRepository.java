package in.sih.dementia.caregiver;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaregiverNoteRepository extends JpaRepository<CaregiverNote, UUID> {
    List<CaregiverNote> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
