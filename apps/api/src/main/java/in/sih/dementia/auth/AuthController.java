package in.sih.dementia.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public record LoginRequest(@Email String email, @NotBlank String password) {}
    public record SessionUser(UUID id, String displayName, Role role) {}
    public record LoginResponse(String accessToken, SessionUser user) {}
    public record ApiResponse<T>(boolean success, T data, String message) {}

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        var user = users.findByEmailIgnoreCase(request.email())
                .filter(u -> encoder.matches(request.password(), u.getPasswordHash()))
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, null, "The email or password is incorrect."));
        }

        var value = new LoginResponse(jwt.issue(user), new SessionUser(user.getId(), user.getDisplayName(), user.getRole()));
        return ResponseEntity.ok(new ApiResponse<>(true, value, "Signed in."));
    }
}
