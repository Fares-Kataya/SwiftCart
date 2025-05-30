package com.example.server.user;

import com.example.server.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository repo;

    @GetMapping("/me")
    public UserDto me(Authentication auth) {
        String email = auth.getName();
        User u = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));
        return UserDto.builder()
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .username(u.getUsername())
                .email(u.getEmail())
                .gender(u.getGender())
                .image(u.getImage())
                .build();
    }
}
