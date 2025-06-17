package com.example.server.product.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
// Assuming you have review logic, you'd need imports for it

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Long id;

    @NotBlank @Size(max=150)
    private String title;

    @NotBlank
    private String description;

    @NotNull @DecimalMin("0.0")
    private BigDecimal price;

    @NotNull
    private Long categoryId;

    @NotNull
    private String categoryName;

    @NotBlank
    private String imageUrl;

    @Min(0)
    private int stock;

    private Double rating;
    private Long reviewCount;
    private Boolean isNew;

    private Instant createdAt;
    private Instant updatedAt;
}