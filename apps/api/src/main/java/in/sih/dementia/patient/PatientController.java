package in.sih.dementia.patient;

import in.sih.dementia.auth.AuthController.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
public class PatientController {
    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/{id}/today")
    public ResponseEntity<ApiResponse<PatientService.TodaySummaryDto>> getTodaySummary(@PathVariable UUID id) {
        var summary = patientService.getTodaySummary(id);
        return ResponseEntity.ok(new ApiResponse<>(true, summary, "Today summary retrieved."));
    }

    @GetMapping("/me/today")
    public ResponseEntity<ApiResponse<PatientService.TodaySummaryDto>> getMyTodaySummary(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        var summary = patientService.getTodaySummary(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, summary, "Today summary retrieved."));
    }

    @PostMapping("/{id}/routine/{taskId}/status")
    public ResponseEntity<ApiResponse<RoutineTask>> updateRoutineStatus(
            @PathVariable UUID id,
            @PathVariable UUID taskId,
            @RequestBody PatientService.RoutineStatusRequest request) {
        var updated = patientService.updateRoutineStatus(taskId, request.status());
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Routine status updated."));
    }

    @PostMapping("/{id}/medications/{scheduleId}/action")
    public ResponseEntity<ApiResponse<MedicationSchedule>> recordMedicationAction(
            @PathVariable UUID id,
            @PathVariable UUID scheduleId,
            @RequestBody PatientService.MedicationActionRequest request) {
        var updated = patientService.recordMedicationAction(scheduleId, id, request.action(), request.note());
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Medication action recorded."));
    }

    @PostMapping("/check-ins")
    public ResponseEntity<ApiResponse<CheckIn>> recordCheckIn(@RequestBody PatientService.CheckInRequest request) {
        var checkIn = patientService.recordCheckIn(request);
        return ResponseEntity.ok(new ApiResponse<>(true, checkIn, "Check-in recorded."));
    }

    @GetMapping("/{id}/check-ins")
    public ResponseEntity<ApiResponse<List<CheckIn>>> getCheckIns(@PathVariable UUID id) {
        var checkIns = patientService.getCheckIns(id);
        return ResponseEntity.ok(new ApiResponse<>(true, checkIns, "Check-ins retrieved."));
    }

    @GetMapping("/{id}/memories")
    public ResponseEntity<ApiResponse<List<MemoryItem>>> getMemories(@PathVariable UUID id) {
        var memories = patientService.getMemories(id);
        return ResponseEntity.ok(new ApiResponse<>(true, memories, "Memory items retrieved."));
    }

    @GetMapping("/{id}/settings")
    public ResponseEntity<ApiResponse<PatientService.PatientSettingsDto>> getSettings(@PathVariable UUID id) {
        var settings = patientService.getSettings(id);
        return ResponseEntity.ok(new ApiResponse<>(true, settings, "Settings retrieved."));
    }

    @PatchMapping("/{id}/settings")
    public ResponseEntity<ApiResponse<PatientService.PatientSettingsDto>> updateSettings(
            @PathVariable UUID id,
            @RequestBody PatientService.PatientSettingsDto request) {
        var updated = patientService.updateSettings(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, updated, "Settings updated."));
    }
}
