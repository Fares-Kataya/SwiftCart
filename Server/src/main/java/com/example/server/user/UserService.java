package com.example.server.user;

import com.example.server.exception.BadRequestException;
import com.example.server.exception.ConflictException;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.user.dto.UserPasswordUpdateDto;
import com.example.server.user.dto.UserProfileUpdateDto;
import com.example.server.user.dto.UserRegistrationDto;

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

    public User register(UserRegistrationDto dto) { // <--- MODIFIED THIS LINE
        userRepository.findByEmail(dto.getEmail())
                .ifPresent(u -> { throw new ConflictException("Email is already in use"); });

        userRepository.findByUsername(dto.getUsername())
                .ifPresent(u -> { throw new ConflictException("Username is already in use"); });

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

    public UserDto updateProfile(String userEmail, UserProfileUpdateDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (dto.getFirstName() != null) {
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            user.setLastName(dto.getLastName());
        }
        if (dto.getEmail() != null && !user.getEmail().equals(dto.getEmail())) {
            userRepository.findByEmail(dto.getEmail())
                    .ifPresent(u -> { throw new ConflictException("New email is already in use"); });
            user.setEmail(dto.getEmail());
        }
        if (dto.getGender() != null) {
            user.setGender(dto.getGender());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getImage() != null) {
            user.setImage(dto.getImage());
        }

        User updatedUser = userRepository.save(user);
        return toUserDto(updatedUser);
    }

    public void updatePassword(String userEmail, UserPasswordUpdateDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid current password");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    private UserDto toUserDto(User u) {
        return UserDto.builder()
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .username(u.getUsername())
                .email(u.getEmail())
                .gender(u.getGender())
                .phone(u.getPhone())
                .image(u.getImage())
                .role(u.getRole())
                .build();
    }
}
