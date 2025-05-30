package com.example.server.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface orderRepository extends JpaRepository<Order,Long> {
    List<Order> findByUserId(Long userId);
}
