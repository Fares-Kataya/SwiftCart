package com.example.server.order.dto;

import jakarta.validation.Valid;
import lombok.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Long id;

    @NotNull(message = "You must supply at least one order item")
    @Size(min = 1, message = "At least one item is required")
    private List<@Valid OrderItemDto> items;

    private BigDecimal totalPrice;
    private String status;
    private Instant orderDate;
}
