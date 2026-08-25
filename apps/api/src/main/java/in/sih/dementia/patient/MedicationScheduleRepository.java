package in.sih.dementia.patient;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, UUID> {
    List<MedicationSchedule> findByPatientIdOrderByScheduledTimeAsc(UUID patientId);
}
