package com.example.server.order;

import com.example.server.order.dto.OrderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public OrderDto place(@Valid @RequestBody OrderDto dto, Authentication auth) {
        return orderService.placeOrder(auth.getName(), dto);
    }

    @GetMapping
    public List<OrderDto> myOrders(Authentication auth) {
        return orderService.listByUser(auth.getName());
    }

    @DeleteMapping("/{id}")
    public void cancel(@PathVariable Long id, Authentication auth) {
        orderService.cancelOrder(auth.getName(), id);
    }

    @GetMapping("/all")
    public List<OrderDto> all() {
        return orderService.listAll();
    }

    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id,
                             @RequestParam String status) {
        orderService.updateStatus(id, status);
    }
}
