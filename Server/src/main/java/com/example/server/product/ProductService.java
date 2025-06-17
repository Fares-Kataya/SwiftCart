package com.example.server.product;

import com.example.server.product.dto.ProductDto;
import com.example.server.exception.BadRequestException;
import com.example.server.exception.ResourceNotFoundException;
import org.springframework.cache.annotation.Cacheable;
import com.example.server.product.dto.PagedResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final Random random = new Random();

    public PagedResultDto<ProductDto> listProducts(
            int page,
            int size,
            String search,
            String categoryName,
            List<String> categories,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<Integer> ratings,
            Boolean inStock,
            Boolean onSale,
            String sortBy) {

        boolean multi = categories != null && !categories.isEmpty();
        boolean single = !multi && categoryName != null && !categoryName.isBlank();

        List<Long> latest10ProductIds = productRepo.findTop10ByOrderByCreatedAtDesc().stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        Sort sort = Sort.unsorted();
        if ("priceAsc".equals(sortBy))
            sort = Sort.by("price").ascending();
        else if ("priceDesc".equals(sortBy))
            sort = Sort.by("price").descending();
        else if ("newest".equals(sortBy))
            sort = Sort.by("createdAt").descending();

        PageRequest pageable = PageRequest.of(page - 1, size, sort);

        Specification<Product> spec = Specification.where(null);

        if (search != null && !search.isBlank()) {
            spec = spec
                    .and((root, query, cb) -> cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
        }

        if (single) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category").get("name")),
                    categoryName.toLowerCase()));
        }

        if (multi) {
            spec = spec.and((root, query, cb) -> root.get("category").get("name").in(categories));
        }

        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }

        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }

        if (ratings != null && !ratings.isEmpty()) {
            // placeholder if rating is persisted in DB, not just generated dynamically
        }

        if (inStock != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThan(root.get("stock"), 0));
        }

        if (onSale != null) {
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("price"), 100)); // Example logic
        }
        

        Page<Product> productPage = productRepo.findAll(spec, pageable);

        List<ProductDto> productDtos = productPage.getContent().stream()
                .map(p -> toDtoWithDerivedFields(p, latest10ProductIds))
                .collect(Collectors.toList());

        List<String> allCategoryNames = categoryRepo.findAll().stream()
                .map(Category::getName)
                .distinct()
                .collect(Collectors.toList());

        return PagedResultDto.<ProductDto>builder()
                .items(productDtos)
                .total(productPage.getTotalElements())
                .categories(allCategoryNames)
                .build();
    }
    
    public Optional<Long> getMaxProductId() {
        return productRepo.findMaxId();
    }

    private ProductDto toDtoWithDerivedFields(Product p, List<Long> latest10ProductIds) {
        ProductDto dto = ProductDto.builder()
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

        dto.setRating(3.0 + (5.0 - 3.0) * random.nextDouble());
        dto.setReviewCount((long) (10 + random.nextInt(491)));
        dto.setIsNew(latest10ProductIds.contains(p.getId()));
        return dto;
    }

    public ProductDto getById(Long id) {
        var p = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toDtoWithDerivedFields(p, productRepo.findTop10ByOrderByCreatedAtDesc().stream()
                .map(Product::getId).collect(Collectors.toList()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto create(ProductDto dto) {
        var cat = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        var p = Product.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .category(cat)
                .imageUrl(dto.getImageUrl())
                .stock(dto.getStock())
                .build();
        return toDtoWithDerivedFields(productRepo.save(p), productRepo.findTop10ByOrderByCreatedAtDesc().stream()
                .map(Product::getId).collect(Collectors.toList()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto update(Long id, ProductDto dto) {
        var existing = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        var cat = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setCategory(cat);
        existing.setImageUrl(dto.getImageUrl());
        existing.setStock(dto.getStock());
        return toDtoWithDerivedFields(productRepo.save(existing), productRepo.findTop10ByOrderByCreatedAtDesc().stream()
                .map(Product::getId).collect(Collectors.toList()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with ID: " + id);
        }
        productRepo.deleteById(id);
    }
}
