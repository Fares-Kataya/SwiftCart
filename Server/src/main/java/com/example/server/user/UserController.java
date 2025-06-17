package com.example.server.user;

import com.example.server.exception.ResourceNotFoundException;
import com.example.server.user.dto.UserDto;
import com.example.server.user.UserService;
import com.example.server.user.dto.UserPasswordUpdateDto;
import com.example.server.user.dto.UserProfileUpdateDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @GetMapping("/me")
    public UserDto me(Authentication auth) {
        String email = auth.getName();
        User u = userService.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + email));
        return toUserDto(u);
    }
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(
            @Valid @RequestBody UserProfileUpdateDto dto,
            Authentication auth) {
        String email = auth.getName();
        UserDto updatedUserDto = userService.updateProfile(email, dto);
        return ResponseEntity.ok(updatedUserDto);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> updatePassword(
            @Valid @RequestBody UserPasswordUpdateDto dto,
            Authentication auth) {
        String email = auth.getName();
        userService.updatePassword(email, dto);
        return ResponseEntity.noContent().build();
    }

    private UserDto toUserDto(User u) {
        return UserDto.builder()
                .id(u.getId())
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
