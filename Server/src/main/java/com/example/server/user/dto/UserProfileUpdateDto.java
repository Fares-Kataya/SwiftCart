package com.example.server.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateDto {
    @NotBlank(message = "First name is required")
    @Size(max = 10, message = "First name must be at most 10 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 10, message = "Last name must be at most 10 characters")
    private String lastName;


    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be at most 100 characters")
    private String email;

    @Size(max = 10, message = "Gender must be at most 10 characters")
    private String gender;

    @Pattern(regexp = "^[0-9()+\\-\\s]*$", message = "Invalid phone number format")
    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String phone;

    @Size(max = 255, message = "Image URL must be at most 255 characters")
    private String image;
}
