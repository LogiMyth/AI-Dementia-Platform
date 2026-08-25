package in.sih.dementia.patient;

import in.sih.dementia.auth.AuthController.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/companion")
public class CompanionController {
    private final CompanionService companionService;

    public CompanionController(CompanionService companionService) {
        this.companionService = companionService;
    }

    public record CompanionMessageRequest(UUID patientId, String message) {}

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<CompanionService.CompanionReply>> sendMessage(@RequestBody CompanionMessageRequest request) {
        var reply = companionService.processMessage(request.patientId(), request.message());
        return ResponseEntity.ok(new ApiResponse<>(true, reply, "Companion responded."));
    }
}
