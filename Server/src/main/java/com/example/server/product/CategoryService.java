package com.example.server.product;

import com.example.server.product.dto.CategoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepo;

    public List<CategoryDto> listRoots() {
        return categoryRepo.findAllByParentIsNull()
                .stream()
                .map(this::toDtoWithChildren)
                .collect(Collectors.toList());
    }

    private CategoryDto toDtoWithChildren(Category cat) {
        return CategoryDto.builder()
                .id(cat.getId())
                .name(cat.getName())
                .imageUrl(cat.getImageUrl())
                .parentId(cat.getParent() != null ? cat.getParent().getId() : null)
                .children(
                        cat.getChildren().stream()
                                .map(child -> CategoryDto.builder()
                                        .id(child.getId())
                                        .name(child.getName())
                                        .imageUrl(child.getImageUrl())
                                        .parentId(cat.getId())
                                        .build()
                                )
                                .collect(Collectors.toList())
                )
                .build();
    }
}
