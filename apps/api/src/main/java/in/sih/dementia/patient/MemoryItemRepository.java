package in.sih.dementia.patient;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemoryItemRepository extends JpaRepository<MemoryItem, UUID> {
    List<MemoryItem> findByPatientIdOrderByCreatedAtAsc(UUID patientId);
}
