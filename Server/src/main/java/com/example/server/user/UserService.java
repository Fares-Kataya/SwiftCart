package com.example.server.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.server.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(UserDto dto) {
        userRepository.findByEmail(dto.getEmail())
                .ifPresent(u -> { throw new IllegalArgumentException("Email is already in use"); });

        userRepository.findByUsername(dto.getUsername())
                .ifPresent(u -> { throw new IllegalArgumentException("Username is already in use"); });

        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .gender(dto.getGender())
                .phone(dto.getPhone())
                .image(dto.getImage())
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
