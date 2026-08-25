package in.sih.dementia;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.dementia.auth.AuthController;
import in.sih.dementia.auth.UserRepository;
import in.sih.dementia.patient.CompanionController;
import in.sih.dementia.patient.PatientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DementiaPlatformApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoadsAndDatabaseSeeded() {
        // Verifies Spring context, Flyway migrations V1–V4, and seeded demo accounts
        assertThat(userRepository.count()).isGreaterThanOrEqualTo(4);
        assertThat(userRepository.findByEmailIgnoreCase("caregiver.asha@example.test")).isPresent();
        assertThat(userRepository.findByEmailIgnoreCase("patient.b@example.test")).isPresent();
    }

    @Test
    void testValidAuthentication() throws Exception {
        var body = new AuthController.LoginRequest("caregiver.asha@example.test", "DemoPass123!");
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.role", is("CAREGIVER")));
    }

    @Test
    void testInvalidAuthentication() throws Exception {
        var body = new AuthController.LoginRequest("caregiver.asha@example.test", "WrongPassword!");
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void testProtectedEndpointAuthorization() throws Exception {
        // Without token -> 403 Forbidden
        mockMvc.perform(get("/me"))
                .andExpect(status().isForbidden());

        // With valid token -> 200 OK
        var body = new AuthController.LoginRequest("caregiver.asha@example.test", "DemoPass123!");
        var loginRes = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andReturn();
        var token = objectMapper.readTree(loginRes.getResponse().getContentAsString()).get("data").get("accessToken").asText();

        mockMvc.perform(get("/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.displayName", is("Asha Sharma")));
    }

    @Test
    void testPatientCoreFlow() throws Exception {
        // 1. Patient login
        var loginBody = new AuthController.LoginRequest("patient.b@example.test", "DemoPass123!");
        var loginRes = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role", is("PATIENT")))
                .andReturn();

        var loginJson = objectMapper.readTree(loginRes.getResponse().getContentAsString());
        var token = loginJson.get("data").get("accessToken").asText();
        var patientUserId = loginJson.get("data").get("user").get("id").asText();

        // 2. Fetch today's summary
        var todayRes = mockMvc.perform(get("/patients/" + patientUserId + "/today")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.preferredName", is("Meera")))
                .andExpect(jsonPath("$.data.routineTasks", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.medications", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        var todayJson = objectMapper.readTree(todayRes.getResponse().getContentAsString());
        var patientProfileId = todayJson.get("data").get("patientId").asText();
        var taskId = todayJson.get("data").get("routineTasks").get(0).get("id").asText();
        var medId = todayJson.get("data").get("medications").get(0).get("id").asText();

        // 3. Mark routine task completed
        var routineBody = new PatientService.RoutineStatusRequest("COMPLETED");
        mockMvc.perform(post("/patients/" + patientProfileId + "/routine/" + taskId + "/status")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(routineBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("COMPLETED")));

        // 4. Mark medication taken
        var medBody = new PatientService.MedicationActionRequest("TAKEN", "Taken with breakfast");
        mockMvc.perform(post("/patients/" + patientProfileId + "/medications/" + medId + "/action")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(medBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("TAKEN")));

        // 5. Submit daily check-in
        var checkInBody = new PatientService.CheckInRequest(
                UUID.fromString(patientProfileId), "GOOD", "GOOD", "Morning", false);
        mockMvc.perform(post("/patients/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkInBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.mood", is("GOOD")));

        // 6. Test safe companion response
        var companionBody = new CompanionController.CompanionMessageRequest(
                UUID.fromString(patientProfileId), "Tell me about my daughter Asha");
        mockMvc.perform(post("/companion/messages")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(companionBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reply", containsString("Asha")));
    }

    @Test
    void testCaregiverCoreFlow() throws Exception {
        // 1. Caregiver login
        var loginBody = new AuthController.LoginRequest("caregiver.asha@example.test", "DemoPass123!");
        var loginRes = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role", is("CAREGIVER")))
                .andReturn();

        var loginJson = objectMapper.readTree(loginRes.getResponse().getContentAsString());
        var token = loginJson.get("data").get("accessToken").asText();

        // 2. Caregiver dashboard
        var dashboardRes = mockMvc.perform(get("/caregiver/dashboard")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        var dashboardJson = objectMapper.readTree(dashboardRes.getResponse().getContentAsString());
        var patientId = dashboardJson.get("data").get(0).get("patientId").asText();

        // 3. Patient summary
        mockMvc.perform(get("/caregiver/patients/" + patientId + "/summary")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.preferredName", is("Meera")));

        // 4. Routines and medications
        mockMvc.perform(get("/caregiver/patients/" + patientId + "/routines")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        mockMvc.perform(get("/caregiver/patients/" + patientId + "/medications")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 5. Activity timeline
        mockMvc.perform(get("/caregiver/patients/" + patientId + "/timeline")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 6. Alerts (seeded alert)
        var alertsRes = mockMvc.perform(get("/caregiver/patients/" + patientId + "/alerts")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andReturn();

        var alertsJson = objectMapper.readTree(alertsRes.getResponse().getContentAsString());
        var alertId = alertsJson.get("data").get(0).get("id").asText();

        // 7. Acknowledge alert
        var ackBody = new HashMap<String, String>();
        ackBody.put("status", "ACKNOWLEDGED");
        ackBody.put("note", "Reminded patient about evening medication.");
        mockMvc.perform(post("/caregiver/alerts/" + alertId + "/acknowledge")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ackBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ACKNOWLEDGED")));

        // 8. AI insights
        mockMvc.perform(get("/caregiver/patients/" + patientId + "/insights")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 9. Add note
        var noteBody = new HashMap<String, String>();
        noteBody.put("noteText", "Patient seemed calm and engaged today.");
        mockMvc.perform(post("/caregiver/patients/" + patientId + "/notes")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noteBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.noteText", is("Patient seemed calm and engaged today.")));

        // 10. List notes
        mockMvc.perform(get("/caregiver/patients/" + patientId + "/notes")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }
}
