package com.example.server.product;

import com.example.server.product.dto.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    public List<ProductDto> listAll() {
        return productRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> searchByTitle(String q) {
        return productRepo.findByTitleContainingIgnoreCase(q).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductDto getById(Long id) {
        return productRepo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto create(ProductDto dto) {
        var cat = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        var p = Product.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(cat)
                .imageUrl(dto.getImageUrl())
                .stock(dto.getStock())
                .build();
        return toDto(productRepo.save(p));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto update(Long id, ProductDto dto) {
        var existing = productRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        var cat = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setCategory(cat);
        existing.setImageUrl(dto.getImageUrl());
        existing.setStock(dto.getStock());
        return toDto(productRepo.save(existing));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
        productRepo.deleteById(id);
    }

    private ProductDto toDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .price(p.getPrice())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .imageUrl(p.getImageUrl())
                .stock(p.getStock())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
