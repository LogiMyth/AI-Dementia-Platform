package in.sih.dementia.patient;

import in.sih.dementia.auth.AuthController.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/emergency")
public class EmergencyController {
    private final PatientService patientService;

    public EmergencyController(PatientService patientService) {
        this.patientService = patientService;
    }

    public record EmergencyActionRequest(UUID patientId, String actionType, String details) {}

    @PostMapping("/action")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerAction(@RequestBody EmergencyActionRequest request) {
        var profile = patientService.resolveProfile(request.patientId());
        String contact = profile.getEmergencyContact() != null ? profile.getEmergencyContact() : "Asha Sharma (Caregiver)";
        
        String message = "CALL_CAREGIVER".equalsIgnoreCase(request.actionType())
                ? "Connecting with " + contact + "..."
                : "Emergency support signal sent. Contacting " + contact + " and local responders.";

        return ResponseEntity.ok(new ApiResponse<>(true, Map.of(
                "actionType", request.actionType(),
                "patientName", profile.getPreferredName(),
                "contactTarget", contact,
                "status", "CONNECTED",
                "message", message
        ), message));
    }
}
