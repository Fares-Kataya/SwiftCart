package com.example.server.order;

import com.example.server.order.dto.*;
import com.example.server.product.ProductRepository;
import com.example.server.exception.BadRequestException;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.product.Product;
import com.example.server.user.User;
import com.example.server.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var order = new Order();
        order.setUser(user);
        order.setOrderDate(Instant.now());
        order.setStatus(OrderStatus.PENDING.toString());

        var items = dto.getItems().stream().map(iDto -> {
            var product = productRepo.findById(iDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + iDto.getProductId()));

            if (product.getStock() < iDto.getQuantity())
                throw new BadRequestException("Insufficient stock for product " + product.getTitle() + ". Available: " + product.getStock());

            product.setStock(product.getStock() - iDto.getQuantity());
            productRepo.save(product);

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepo.findByUserId(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    public void cancelOrder(String userEmail, Long orderId) {
        var order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        if (!order.getUser().getEmail().equals(userEmail))
            throw new BadRequestException("You are not authorized to cancel this order.");
        if (!"PENDING".equals(order.getStatus()))
            throw new BadRequestException("Can only cancel pending orders.");
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepo.save(product);
            }
        }
        order.setStatus(OrderStatus.CANCELLED.toString());
        orderRepo.save(order);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderDto> listAll() {
        return orderRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void updateStatus(Long orderId, String newStatus) {
        var order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        order.setStatus(newStatus);
        orderRepo.save(order);
    }

    private OrderDto toDto(Order o) {
        var items = o.getItems().stream().map(i -> OrderItemDto.builder()
                .id(i.getId())
                .productId(i.getProduct() != null ? i.getProduct().getId() : null)
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
