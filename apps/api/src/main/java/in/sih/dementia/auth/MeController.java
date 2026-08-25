package in.sih.dementia.auth;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class MeController {
    private final UserRepository users;

    public MeController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/me")
    public AuthController.ApiResponse<AuthController.SessionUser> me(Authentication authentication) {
        var user = users.findById(UUID.fromString(authentication.getName())).orElseThrow();
        return new AuthController.ApiResponse<>(true, new AuthController.SessionUser(user.getId(), user.getDisplayName(), user.getRole()), "Current session.");
    }
}
