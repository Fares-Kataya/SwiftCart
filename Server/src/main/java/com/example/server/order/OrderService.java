package com.example.server.order;

import com.example.server.order.dto.*;
import com.example.server.product.ProductRepository;
import com.example.server.user.User;
import com.example.server.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public OrderDto placeOrder(String userEmail, OrderDto dto) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        var order = new Order();
        order.setUser(user);

        var items = dto.getItems().stream().map(iDto -> {
            var product = productRepo.findById(iDto.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + iDto.getProductId()));

            if (product.getStock() < iDto.getQuantity())
                throw new IllegalArgumentException("Insufficient stock for product " + product.getId());

            product.setStock(product.getStock() - iDto.getQuantity());

            var item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(iDto.getQuantity());
            item.setUnitPrice(product.getPrice());
            return item;
        }).collect(Collectors.toList());

        order.setItems(items);
        BigDecimal total = items.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalPrice(total);

        var saved = orderRepo.save(order);
        return toDto(saved);
    }

    public List<OrderDto> listByUser(String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderRepo.findByUserId(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void cancelOrder(String userEmail, Long orderId) {
        var order = orderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getUser().getEmail().equals(userEmail))
            throw new IllegalArgumentException("Not your order");
        if (!"PENDING".equals(order.getStatus()))
            throw new IllegalArgumentException("Can only cancel pending orders");
        order.setStatus("CANCELLED");
        orderRepo.save(order);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderDto> listAll() {
        return orderRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void updateStatus(Long orderId, String newStatus) {
        var order = orderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(newStatus);
        orderRepo.save(order);
    }

    private OrderDto toDto(Order o) {
        var items = o.getItems().stream().map(i -> OrderItemDto.builder()
                .id(i.getId())
                .productId(i.getProduct().getId())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .build()
        ).collect(Collectors.toList());

        return OrderDto.builder()
                .id(o.getId())
                .items(items)
                .totalPrice(o.getTotalPrice())
                .status(o.getStatus())
                .orderDate(o.getOrderDate())
                .build();
    }
}
