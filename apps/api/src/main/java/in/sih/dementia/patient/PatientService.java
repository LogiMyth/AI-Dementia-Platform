package in.sih.dementia.patient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PatientService {
    private final PatientProfileRepository profileRepo;
    private final RoutineTaskRepository routineRepo;
    private final MedicationScheduleRepository medicationRepo;
    private final MedicationEventRepository medicationEventRepo;
    private final CheckInRepository checkInRepo;
    private final MemoryItemRepository memoryRepo;
    private final ObjectMapper objectMapper;

    public PatientService(PatientProfileRepository profileRepo,
                          RoutineTaskRepository routineRepo,
                          MedicationScheduleRepository medicationRepo,
                          MedicationEventRepository medicationEventRepo,
                          CheckInRepository checkInRepo,
                          MemoryItemRepository memoryRepo,
                          ObjectMapper objectMapper) {
        this.profileRepo = profileRepo;
        this.routineRepo = routineRepo;
        this.medicationRepo = medicationRepo;
        this.medicationEventRepo = medicationEventRepo;
        this.checkInRepo = checkInRepo;
        this.memoryRepo = memoryRepo;
        this.objectMapper = objectMapper;
    }

    public PatientProfile resolveProfile(UUID patientOrUserId) {
        return profileRepo.findById(patientOrUserId)
                .or(() -> profileRepo.findByUserId(patientOrUserId))
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found for: " + patientOrUserId));
    }

    public record TodaySummaryDto(
            UUID patientId,
            String preferredName,
            String emergencyContact,
            String preferredLanguage,
            List<RoutineTask> routineTasks,
            List<MedicationSchedule> medications,
            CheckIn latestCheckIn,
            String nextAction,
            int completedCount,
            int totalCount
    ) {}

    public record CheckInRequest(
            UUID patientId,
            String mood,
            String sleepQuality,
            String orientationResponse,
            boolean helpRequested
    ) {}

    public record MedicationActionRequest(
            String action,
            String note
    ) {}

    public record RoutineStatusRequest(
            String status
    ) {}

    public record PatientSettingsDto(
            UUID patientId,
            String preferredName,
            String preferredLanguage,
            boolean largeText,
            boolean highContrast,
            boolean voicePrompts,
            String emergencyContact
    ) {}

    @Transactional(readOnly = true)
    public TodaySummaryDto getTodaySummary(UUID patientOrUserId) {
        var profile = resolveProfile(patientOrUserId);
        var routines = routineRepo.findByPatientIdOrderByScheduledTimeAsc(profile.getId());
        var medications = medicationRepo.findByPatientIdOrderByScheduledTimeAsc(profile.getId());
        var latestCheckIn = checkInRepo.findTop1ByPatientIdOrderBySubmittedAtDesc(profile.getId()).orElse(null);

        long completedRoutines = routines.stream().filter(r -> "COMPLETED".equalsIgnoreCase(r.getStatus())).count();
        long completedMeds = medications.stream().filter(m -> "TAKEN".equalsIgnoreCase(m.getStatus())).count();
        int completedCount = (int) (completedRoutines + completedMeds);
        int totalCount = routines.size() + medications.size();

        String nextAction = "Take a calm rest. All morning activities are complete.";
        var pendingMed = medications.stream().filter(m -> "PENDING".equalsIgnoreCase(m.getStatus())).findFirst();
        if (pendingMed.isPresent()) {
            nextAction = "Take " + pendingMed.get().getMedicationLabel() + " (" + pendingMed.get().getScheduledTime() + ")";
        } else {
            var pendingRoutine = routines.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).findFirst();
            if (pendingRoutine.isPresent()) {
                nextAction = pendingRoutine.get().getTitle() + " (" + pendingRoutine.get().getScheduledTime() + ")";
            }
        }

        return new TodaySummaryDto(
                profile.getId(),
                profile.getPreferredName(),
                profile.getEmergencyContact() != null ? profile.getEmergencyContact() : "Asha (Caregiver)",
                profile.getPreferredLanguage(),
                routines,
                medications,
                latestCheckIn,
                nextAction,
                completedCount,
                totalCount
        );
    }

    @Transactional
    public RoutineTask updateRoutineStatus(UUID taskId, String status) {
        var task = routineRepo.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Routine task not found: " + taskId));
        task.setStatus(status.toUpperCase());
        return routineRepo.save(task);
    }

    @Transactional
    public MedicationSchedule recordMedicationAction(UUID scheduleId, UUID patientId, String action, String note) {
        var med = medicationRepo.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Medication schedule not found: " + scheduleId));
        med.setStatus(action.toUpperCase());
        medicationRepo.save(med);

        var event = new MedicationEvent(UUID.randomUUID(), scheduleId, med.getPatientId(), action.toUpperCase(), note);
        medicationEventRepo.save(event);
        return med;
    }

    @Transactional
    public CheckIn recordCheckIn(CheckInRequest req) {
        var profile = resolveProfile(req.patientId());
        var checkIn = new CheckIn(
                UUID.randomUUID(),
                profile.getId(),
                req.mood() != null ? req.mood().toUpperCase() : "OKAY",
                req.sleepQuality() != null ? req.sleepQuality().toUpperCase() : "GOOD",
                req.orientationResponse(),
                req.helpRequested()
        );
        return checkInRepo.save(checkIn);
    }

    @Transactional(readOnly = true)
    public List<CheckIn> getCheckIns(UUID patientOrUserId) {
        var profile = resolveProfile(patientOrUserId);
        return checkInRepo.findByPatientIdOrderBySubmittedAtDesc(profile.getId());
    }

    @Transactional(readOnly = true)
    public List<MemoryItem> getMemories(UUID patientOrUserId) {
        var profile = resolveProfile(patientOrUserId);
        return memoryRepo.findByPatientIdOrderByCreatedAtAsc(profile.getId());
    }

    @Transactional(readOnly = true)
    public PatientSettingsDto getSettings(UUID patientOrUserId) {
        var profile = resolveProfile(patientOrUserId);
        boolean largeText = true;
        boolean highContrast = false;
        boolean voicePrompts = true;

        try {
            if (profile.getAccessibilityPreferences() != null && !profile.getAccessibilityPreferences().isBlank()) {
                JsonNode node = objectMapper.readTree(profile.getAccessibilityPreferences());
                if (node.has("largeText")) largeText = node.get("largeText").asBoolean();
                if (node.has("highContrast")) highContrast = node.get("highContrast").asBoolean();
                if (node.has("voicePrompts")) voicePrompts = node.get("voicePrompts").asBoolean();
            }
        } catch (Exception ignored) {}

        return new PatientSettingsDto(
                profile.getId(),
                profile.getPreferredName(),
                profile.getPreferredLanguage(),
                largeText,
                highContrast,
                voicePrompts,
                profile.getEmergencyContact()
        );
    }

    @Transactional
    public PatientSettingsDto updateSettings(UUID patientOrUserId, PatientSettingsDto dto) {
        var profile = resolveProfile(patientOrUserId);
        if (dto.preferredName() != null && !dto.preferredName().isBlank()) {
            profile.setPreferredName(dto.preferredName());
        }
        if (dto.preferredLanguage() != null && !dto.preferredLanguage().isBlank()) {
            profile.setPreferredLanguage(dto.preferredLanguage());
        }
        if (dto.emergencyContact() != null) {
            profile.setEmergencyContact(dto.emergencyContact());
        }

        Map<String, Object> prefs = new HashMap<>();
        prefs.put("largeText", dto.largeText());
        prefs.put("highContrast", dto.highContrast());
        prefs.put("voicePrompts", dto.voicePrompts());
        try {
            profile.setAccessibilityPreferences(objectMapper.writeValueAsString(prefs));
        } catch (Exception ignored) {}

        profileRepo.save(profile);
        return getSettings(profile.getId());
    }
}
