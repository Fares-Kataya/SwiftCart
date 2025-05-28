package com.example.server.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface orderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
}
