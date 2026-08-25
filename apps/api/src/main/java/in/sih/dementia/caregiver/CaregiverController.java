package in.sih.dementia.caregiver;

import in.sih.dementia.auth.AuthController.ApiResponse;
import in.sih.dementia.patient.MedicationSchedule;
import in.sih.dementia.patient.RoutineTask;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/caregiver")
public class CaregiverController {

    private final CaregiverService caregiverService;

    public CaregiverController(CaregiverService caregiverService) {
        this.caregiverService = caregiverService;
    }

    /** Dashboard: all patients linked to this caregiver */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<List<CaregiverService.PatientSummaryDto>>> getDashboard(Authentication auth) {
        UUID caregiverId = UUID.fromString(auth.getName());
        var patients = caregiverService.getPatientsForCaregiver(caregiverId);
        return ResponseEntity.ok(new ApiResponse<>(true, patients, "Dashboard retrieved."));
    }

    /** Single patient summary (overview card) */
    @GetMapping("/patients/{patientId}/summary")
    public ResponseEntity<ApiResponse<CaregiverService.PatientSummaryDto>> getPatientSummary(
            @PathVariable UUID patientId) {
        var summary = caregiverService.getPatientSummary(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, summary, "Patient summary retrieved."));
    }

    /** Routines for a patient */
    @GetMapping("/patients/{patientId}/routines")
    public ResponseEntity<ApiResponse<List<RoutineTask>>> getRoutines(@PathVariable UUID patientId) {
        return ResponseEntity.ok(new ApiResponse<>(true, caregiverService.getRoutines(patientId), "Routines retrieved."));
    }

    /** Add a new routine for a patient */
    @PostMapping("/patients/{patientId}/routines")
    public ResponseEntity<ApiResponse<RoutineTask>> addRoutine(
            @PathVariable UUID patientId,
            @RequestBody CaregiverService.CreateRoutineRequest req) {
        var task = caregiverService.addRoutine(patientId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, task, "Routine added."));
    }

    /** Medications for a patient */
    @GetMapping("/patients/{patientId}/medications")
    public ResponseEntity<ApiResponse<List<MedicationSchedule>>> getMedications(@PathVariable UUID patientId) {
        return ResponseEntity.ok(new ApiResponse<>(true, caregiverService.getMedications(patientId), "Medications retrieved."));
    }

    /** Add a new medication schedule for a patient */
    @PostMapping("/patients/{patientId}/medications")
    public ResponseEntity<ApiResponse<MedicationSchedule>> addMedication(
            @PathVariable UUID patientId,
            @RequestBody CaregiverService.CreateMedicationRequest req) {
        var med = caregiverService.addMedication(patientId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, med, "Medication added."));
    }

    /** Activity/event timeline for a patient */
    @GetMapping("/patients/{patientId}/timeline")
    public ResponseEntity<ApiResponse<List<CaregiverService.TimelineEventDto>>> getTimeline(
            @PathVariable UUID patientId) {
        var events = caregiverService.getTimeline(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, events, "Timeline retrieved."));
    }

    /** Alerts for a patient */
    @GetMapping("/patients/{patientId}/alerts")
    public ResponseEntity<ApiResponse<List<Alert>>> getAlerts(@PathVariable UUID patientId) {
        return ResponseEntity.ok(new ApiResponse<>(true, caregiverService.getAlerts(patientId), "Alerts retrieved."));
    }

    /** Acknowledge or resolve an alert */
    @PostMapping("/alerts/{alertId}/acknowledge")
    public ResponseEntity<ApiResponse<Alert>> acknowledgeAlert(
            @PathVariable UUID alertId,
            @RequestBody CaregiverService.AcknowledgeAlertRequest req,
            Authentication auth) {
        UUID caregiverId = UUID.fromString(auth.getName());
        var updated = caregiverService.acknowledgeAlert(alertId, caregiverId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Alert updated."));
    }

    /** AI insights for a patient */
    @GetMapping("/patients/{patientId}/insights")
    public ResponseEntity<ApiResponse<List<AIInsight>>> getInsights(@PathVariable UUID patientId) {
        return ResponseEntity.ok(new ApiResponse<>(true, caregiverService.getInsights(patientId), "Insights retrieved."));
    }

    /** Caregiver notes for a patient */
    @GetMapping("/patients/{patientId}/notes")
    public ResponseEntity<ApiResponse<List<CaregiverNote>>> getNotes(@PathVariable UUID patientId) {
        return ResponseEntity.ok(new ApiResponse<>(true, caregiverService.getNotes(patientId), "Notes retrieved."));
    }

    /** Add a caregiver note */
    @PostMapping("/patients/{patientId}/notes")
    public ResponseEntity<ApiResponse<CaregiverNote>> addNote(
            @PathVariable UUID patientId,
            @RequestBody CaregiverService.CreateNoteRequest req,
            Authentication auth) {
        UUID caregiverId = UUID.fromString(auth.getName());
        var note = caregiverService.addNote(patientId, caregiverId, req);
        return ResponseEntity.ok(new ApiResponse<>(true, note, "Note added."));
    }
}
