package in.sih.dementia.auth;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
interface UserRepository extends JpaRepository<User, UUID> { Optional<User> findByEmailIgnoreCase(String email); }
