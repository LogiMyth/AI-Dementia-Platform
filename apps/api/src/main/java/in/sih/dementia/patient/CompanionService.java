package in.sih.dementia.patient;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CompanionService {
    private final CompanionMessageRepository companionMessageRepo;
    private final PatientService patientService;

    public CompanionService(CompanionMessageRepository companionMessageRepo, PatientService patientService) {
        this.companionMessageRepo = companionMessageRepo;
        this.patientService = patientService;
    }

    public record CompanionReply(
            String reply,
            String reassuringCue,
            boolean escalationSuggested
    ) {}

    @Transactional
    public CompanionReply processMessage(UUID patientOrUserId, String message) {
        var profile = patientService.resolveProfile(patientOrUserId);
        String cleaned = message != null ? message.trim().toLowerCase(Locale.ROOT) : "";

        String reply;
        String cue = "You are in a safe place. Everything is okay.";
        boolean escalation = false;

        if (cleaned.contains("emergency") || cleaned.contains("help me") || cleaned.contains("fall") || cleaned.contains("hurt") || cleaned.contains("pain")) {
            reply = "I hear you. Let's get help right now. You can tap 'Call Caregiver' or the Emergency button.";
            cue = "Emergency contact: " + (profile.getEmergencyContact() != null ? profile.getEmergencyContact() : "Asha (Caregiver)");
            escalation = true;
        } else if (cleaned.contains("medicine") || cleaned.contains("pill") || cleaned.contains("dose")) {
            reply = "Your medicine schedule is right on your Today screen. Asha has everything organized for you.";
            cue = "Check your Today screen for your next scheduled medicine.";
        } else if (cleaned.contains("where") || cleaned.contains("who") || cleaned.contains("confused") || cleaned.contains("lost")) {
            reply = "You are at home in your comfortable room. " + profile.getPreferredName() + ", today is a calm and peaceful day.";
            cue = "Your family and caregivers are right nearby.";
        } else if (cleaned.contains("daughter") || cleaned.contains("asha") || cleaned.contains("family")) {
            reply = "Asha is your daughter. She loves you very much and checks in on you every single day.";
            cue = "You can tap Call Caregiver anytime you want to speak with Asha.";
        } else if (cleaned.contains("garden") || cleaned.contains("flower") || cleaned.contains("marigold")) {
            reply = "The yellow marigolds in your garden are blooming beautifully today!";
            cue = "Looking at nature brings peace and calm.";
        } else if (cleaned.contains("sleep") || cleaned.contains("tired") || cleaned.contains("rest")) {
            reply = "It's a wonderful idea to take a gentle rest whenever you feel tired.";
            cue = "Sit back, take a deep breath, and relax.";
        } else {
            reply = "Hello " + profile.getPreferredName() + "! I am here with you today. Would you like to check your routine, view family photos, or hear a calm story?";
            cue = "Take things one step at a time.";
        }

        var entity = new CompanionMessage(UUID.randomUUID(), profile.getId(), message, reply, escalation);
        companionMessageRepo.save(entity);

        return new CompanionReply(reply, cue, escalation);
    }
}
