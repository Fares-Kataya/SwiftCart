package com.example.server.product;

import com.example.server.product.dto.ProductDto;
import com.example.server.product.dto.PagedResultDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public PagedResultDto<ProductDto> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Integer> ratings,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Boolean onSale,
            @RequestParam(required = false) String sort) {
        return productService.listProducts(page, size, search, category, categories, minPrice, maxPrice, ratings,
                inStock, onSale, sort);
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/max-id")
    public ResponseEntity<Long> getMaxId() {
        Long max = productService.getMaxProductId().orElse(0L);
        return ResponseEntity.ok(max);
    }
    
    @PostMapping
    public ProductDto create(@Valid @RequestBody ProductDto dto) {
        return productService.create(dto);
    }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        return productService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
