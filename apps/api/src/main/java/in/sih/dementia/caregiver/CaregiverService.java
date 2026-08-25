package in.sih.dementia.caregiver;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.dementia.patient.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class CaregiverService {

    private final CaregiverPatientLinkRepository linkRepo;
    private final PatientProfileRepository profileRepo;
    private final RoutineTaskRepository routineRepo;
    private final MedicationScheduleRepository medicationRepo;
    private final MedicationEventRepository medicationEventRepo;
    private final CheckInRepository checkInRepo;
    private final AlertRepository alertRepo;
    private final AIInsightRepository insightRepo;
    private final CaregiverNoteRepository noteRepo;
    private final ObjectMapper objectMapper;

    public CaregiverService(
            CaregiverPatientLinkRepository linkRepo,
            PatientProfileRepository profileRepo,
            RoutineTaskRepository routineRepo,
            MedicationScheduleRepository medicationRepo,
            MedicationEventRepository medicationEventRepo,
            CheckInRepository checkInRepo,
            AlertRepository alertRepo,
            AIInsightRepository insightRepo,
            CaregiverNoteRepository noteRepo,
            ObjectMapper objectMapper) {
        this.linkRepo = linkRepo;
        this.profileRepo = profileRepo;
        this.routineRepo = routineRepo;
        this.medicationRepo = medicationRepo;
        this.medicationEventRepo = medicationEventRepo;
        this.checkInRepo = checkInRepo;
        this.alertRepo = alertRepo;
        this.insightRepo = insightRepo;
        this.noteRepo = noteRepo;
        this.objectMapper = objectMapper;
    }

    /* ---- DTOs ---- */

    public record PatientSummaryDto(
            UUID patientId,
            UUID userId,
            String preferredName,
            String relationship,
            String preferredLanguage,
            String emergencyContact,
            String riskLevel,
            long activeAlertsCount,
            int adherencePercentage,
            int completedTasksToday,
            int totalTasksToday,
            String latestMood,
            String latestSleep,
            Instant lastActive
    ) {}

    public record TimelineEventDto(
            UUID id,
            String type,
            String title,
            String description,
            Instant timestamp,
            String severity
    ) {}

    public record AcknowledgeAlertRequest(
            String status,
            String note
    ) {}

    public record CreateNoteRequest(String noteText) {}

    public record CreateRoutineRequest(String title, String cue, String scheduledTime, String recurrence) {}

    public record CreateMedicationRequest(
            String medicationLabel,
            String dosageText,
            String scheduledTime,
            String instructions
    ) {}

    /* ---- Queries ---- */

    @Transactional(readOnly = true)
    public List<PatientSummaryDto> getPatientsForCaregiver(UUID caregiverId) {
        var links = linkRepo.findByCaregiverIdAndActiveTrue(caregiverId);
        // Fallback: if no links (e.g. admin/demo), return all patients
        List<PatientProfile> profiles;
        if (links.isEmpty()) {
            profiles = profileRepo.findAll();
        } else {
            var patientIds = links.stream().map(CaregiverPatientLink::getPatientId).toList();
            profiles = profileRepo.findAll().stream()
                    .filter(p -> patientIds.contains(p.getId()))
                    .toList();
        }
        Map<UUID, String> linkRelations = new HashMap<>();
        for (var link : links) linkRelations.put(link.getPatientId(), link.getRelationshipLabel());

        return profiles.stream().map(p -> buildPatientSummary(p, linkRelations.getOrDefault(p.getId(), "Caregiver"))).toList();
    }

    private PatientSummaryDto buildPatientSummary(PatientProfile p, String relationship) {
        var routines = routineRepo.findByPatientIdOrderByScheduledTimeAsc(p.getId());
        var medications = medicationRepo.findByPatientIdOrderByScheduledTimeAsc(p.getId());
        long activeAlerts = alertRepo.countByPatientIdAndStatus(p.getId(), "ACTIVE");

        int total = routines.size() + medications.size();
        int completed = (int) (
                routines.stream().filter(r -> "COMPLETED".equalsIgnoreCase(r.getStatus())).count() +
                medications.stream().filter(m -> "TAKEN".equalsIgnoreCase(m.getStatus())).count()
        );
        int takenMeds = (int) medications.stream().filter(m -> "TAKEN".equalsIgnoreCase(m.getStatus())).count();
        int adherence = medications.isEmpty() ? 100 : (int) Math.round(100.0 * takenMeds / medications.size());

        var latestCheckIn = checkInRepo.findTop1ByPatientIdOrderBySubmittedAtDesc(p.getId()).orElse(null);
        String mood = latestCheckIn != null ? latestCheckIn.getMood() : null;
        String sleep = latestCheckIn != null ? latestCheckIn.getSleepQuality() : null;
        Instant lastActive = latestCheckIn != null ? latestCheckIn.getSubmittedAt() : p.getCreatedAt();

        var latestInsight = insightRepo.findTop1ByPatientIdOrderByCreatedAtDesc(p.getId());
        String riskLevel = latestInsight.map(AIInsight::getRiskLevel).orElse("LOW");

        return new PatientSummaryDto(
                p.getId(), p.getUserId(), p.getPreferredName(), relationship,
                p.getPreferredLanguage(), p.getEmergencyContact(),
                riskLevel, activeAlerts, adherence, completed, total,
                mood, sleep, lastActive
        );
    }

    @Transactional(readOnly = true)
    public PatientSummaryDto getPatientSummary(UUID patientId) {
        var profile = resolveProfile(patientId);
        return buildPatientSummary(profile, "Caregiver");
    }

    @Transactional(readOnly = true)
    public List<RoutineTask> getRoutines(UUID patientId) {
        return routineRepo.findByPatientIdOrderByScheduledTimeAsc(resolveProfile(patientId).getId());
    }

    @Transactional(readOnly = true)
    public List<MedicationSchedule> getMedications(UUID patientId) {
        return medicationRepo.findByPatientIdOrderByScheduledTimeAsc(resolveProfile(patientId).getId());
    }

    @Transactional(readOnly = true)
    public List<TimelineEventDto> getTimeline(UUID patientId) {
        var profile = resolveProfile(patientId);
        UUID pid = profile.getId();
        List<TimelineEventDto> events = new ArrayList<>();

        for (var evt : medicationEventRepo.findByPatientIdOrderByOccurredAtDesc(pid)) {
            String sev = "TAKEN".equalsIgnoreCase(evt.getAction()) ? "INFO" :
                         "HELP".equalsIgnoreCase(evt.getAction()) ? "HIGH" : "MEDIUM";
            events.add(new TimelineEventDto(evt.getId(), "MEDICATION",
                    "Medication: " + evt.getAction(), evt.getNote() != null ? evt.getNote() : evt.getAction(),
                    evt.getOccurredAt(), sev));
        }
        for (var ci : checkInRepo.findByPatientIdOrderBySubmittedAtDesc(pid)) {
            String sev = "LOW".equalsIgnoreCase(ci.getMood()) ? "MEDIUM" : "INFO";
            events.add(new TimelineEventDto(ci.getId(), "CHECKIN",
                    "Daily Check-in",
                    "Mood: " + ci.getMood() + " · Sleep: " + ci.getSleepQuality() +
                    (ci.isHelpRequested() ? " · Help requested" : ""),
                    ci.getSubmittedAt(), sev));
        }
        for (var alert : alertRepo.findByPatientIdOrderByCreatedAtDesc(pid)) {
            events.add(new TimelineEventDto(alert.getId(), "ALERT",
                    "Alert: " + alert.getType(), alert.getRationale(),
                    alert.getCreatedAt(), alert.getSeverity()));
        }
        for (var note : noteRepo.findByPatientIdOrderByCreatedAtDesc(pid)) {
            events.add(new TimelineEventDto(note.getId(), "NOTE",
                    "Caregiver Note", note.getNoteText(), note.getCreatedAt(), "INFO"));
        }

        events.sort(Comparator.comparing(TimelineEventDto::timestamp).reversed());
        return events;
    }

    @Transactional(readOnly = true)
    public List<Alert> getAlerts(UUID patientId) {
        return alertRepo.findByPatientIdOrderByCreatedAtDesc(resolveProfile(patientId).getId());
    }

    @Transactional(readOnly = true)
    public List<AIInsight> getInsights(UUID patientId) {
        return insightRepo.findByPatientIdOrderByCreatedAtDesc(resolveProfile(patientId).getId());
    }

    @Transactional(readOnly = true)
    public List<CaregiverNote> getNotes(UUID patientId) {
        return noteRepo.findByPatientIdOrderByCreatedAtDesc(resolveProfile(patientId).getId());
    }

    /* ---- Mutations ---- */

    @Transactional
    public Alert acknowledgeAlert(UUID alertId, UUID caregiverId, AcknowledgeAlertRequest req) {
        var alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));
        alert.setStatus(req.status() != null ? req.status().toUpperCase() : "ACKNOWLEDGED");
        alert.setAcknowledgedBy(caregiverId);
        alert.setAcknowledgedAt(Instant.now());
        alert.setNote(req.note());
        return alertRepo.save(alert);
    }

    @Transactional
    public CaregiverNote addNote(UUID patientId, UUID caregiverId, CreateNoteRequest req) {
        var profile = resolveProfile(patientId);
        var note = new CaregiverNote(UUID.randomUUID(), profile.getId(), caregiverId, req.noteText());
        return noteRepo.save(note);
    }

    @Transactional
    public RoutineTask addRoutine(UUID patientId, CreateRoutineRequest req) {
        var profile = resolveProfile(patientId);
        var task = new RoutineTask(UUID.randomUUID(), profile.getId(), req.title(), req.cue(),
                req.scheduledTime(), req.recurrence() != null ? req.recurrence() : "DAILY");
        return routineRepo.save(task);
    }

    @Transactional
    public MedicationSchedule addMedication(UUID patientId, CreateMedicationRequest req) {
        var profile = resolveProfile(patientId);
        var med = new MedicationSchedule(UUID.randomUUID(), profile.getId(), req.medicationLabel(),
                req.dosageText(), req.scheduledTime(), req.instructions(), 2);
        return medicationRepo.save(med);
    }

    /* ---- Helpers ---- */

    private PatientProfile resolveProfile(UUID id) {
        return profileRepo.findById(id)
                .or(() -> profileRepo.findByUserId(id))
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found: " + id));
    }

    private List<String> parseSignals(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of(json);
        }
    }
}
