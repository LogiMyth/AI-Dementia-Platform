package in.sih.dementia.caregiver;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.dementia.patient.CheckInRepository;
import in.sih.dementia.patient.MedicationEventRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

/** Deterministic, non-clinical observations derived from recorded patient activity. */
@Service
public class CaregiverInsightService {
    private final MedicationEventRepository medicationEvents;
    private final CheckInRepository checkIns;
    private final AIInsightRepository insights;
    private final ObjectMapper objectMapper;

    public CaregiverInsightService(MedicationEventRepository medicationEvents,
                                   CheckInRepository checkIns,
                                   AIInsightRepository insights,
                                   ObjectMapper objectMapper) {
        this.medicationEvents = medicationEvents;
        this.checkIns = checkIns;
        this.insights = insights;
        this.objectMapper = objectMapper;
    }

    public Optional<AIInsight> analyze(UUID patientId) {
        var signals = new ArrayList<String>();
        var medicationEventsForPatient = medicationEvents.findByPatientIdOrderByOccurredAtDesc(patientId);
        var checkInsForPatient = checkIns.findByPatientIdOrderBySubmittedAtDesc(patientId);

        long medicationHelp = medicationEventsForPatient.stream()
                .filter(event -> "HELP".equalsIgnoreCase(event.getAction())).count();
        long medicationDelayedOrMissed = medicationEventsForPatient.stream()
                .filter(event -> "LATER".equalsIgnoreCase(event.getAction()) || "MISSED".equalsIgnoreCase(event.getAction())).count();
        long lowMood = checkInsForPatient.stream()
                .filter(checkIn -> "LOW".equalsIgnoreCase(checkIn.getMood())).count();
        long poorSleep = checkInsForPatient.stream()
                .filter(checkIn -> "POOR".equalsIgnoreCase(checkIn.getSleepQuality())).count();
        long helpRequested = checkInsForPatient.stream().filter(checkIn -> checkIn.isHelpRequested()).count();

        if (medicationHelp > 0) signals.add("A medication action was marked as needing help.");
        if (medicationDelayedOrMissed > 0) signals.add(medicationDelayedOrMissed + " medication action(s) were delayed or missed.");
        if (lowMood > 0) signals.add("A recent check-in recorded a low mood.");
        if (poorSleep > 0) signals.add("A recent check-in recorded poor sleep.");
        if (helpRequested > 0) signals.add("The patient requested help in a recent check-in.");

        if (signals.isEmpty()) return Optional.empty();

        boolean highAttention = medicationHelp > 0 || helpRequested > 0;
        String riskLevel = highAttention ? "HIGH" : "MEDIUM";
        String summary = highAttention
                ? "Attention recommended: recent activity may need caregiver follow-up. This is an observation from recorded activity, not a clinical diagnosis."
                : "Possible pattern: recent activity suggests a gentle caregiver check-in may be helpful. This is an observation from recorded activity, not a clinical diagnosis.";
        String action = highAttention
                ? "Consider checking in with the patient now, ask whether help is needed, and follow the established care plan."
                : "Consider a gentle check-in about the recent activity and whether practical support is needed.";

        try {
            var latest = insights.findTop1ByPatientIdOrderByCreatedAtDesc(patientId);
            String encodedSignals = objectMapper.writeValueAsString(signals);
            if (latest.isPresent() && latest.get().getRiskLevel().equals(riskLevel)
                    && latest.get().getContributingSignals().equals(encodedSignals)) {
                return Optional.of(latest.get());
            }
            return Optional.of(insights.save(new AIInsight(null, patientId, summary, riskLevel,
                    encodedSignals, action, "deterministic-rules")));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }
}
