package com.macifuinaj.catalog.catalog.controller;

import com.macifuinaj.catalog.catalog.dto.ProductResponse;
import com.macifuinaj.catalog.catalog.entity.ProductStatus;
import com.macifuinaj.catalog.catalog.service.ProductService;
import com.macifuinaj.catalog.common.exception.DuplicateProductException;
import com.macifuinaj.catalog.common.exception.ProductNotFoundException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ProductService productService;

    private ProductResponse sampleResponse(String id) {
        return new ProductResponse(
                id,
                "SKU-1",
                "iPhone",
                "iphone",
                "A phone",
                new BigDecimal("999.9900"),
                "USD",
                ProductStatus.ACTIVE,
                Instant.now(),
                Instant.now(),
                0L
        );
    }

    private Map<String, Object> validBody() {
        return Map.of(
                "sku", "SKU-1",
                "name", "iPhone",
                "slug", "iphone",
                "description", "A phone",
                "price", 999.99,
                "currency", "USD",
                "status", "ACTIVE"
        );
    }

    @Test
    void createReturns201() throws Exception {

        String id = "68c35e7ca14cbf72660ad543";

        when(productService.create(any()))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validBody())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.sku").value("SKU-1"));
    }

    @Test
    void createReturns400OnValidationError() throws Exception {

        Map<String, Object> invalid = Map.of(
                "sku", "",
                "name", "iPhone",
                "slug", "iphone",
                "price", -5,
                "currency", "US",
                "status", "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Failed"));
    }

    @Test
    void createReturns409OnDuplicate() throws Exception {

        when(productService.create(any()))
                .thenThrow(DuplicateProductException.forSku("SKU-1"));

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validBody())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Duplicate Product"));
    }

    @Test
    void getByIdReturns200() throws Exception {

        String id = "68c35e7ca14cbf72660ad544";

        when(productService.getById(id))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(get("/api/v1/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    void getByIdReturns404() throws Exception {

        String id = "68c35e7ca14cbf72660ad545";

        when(productService.getById(id))
                .thenThrow(new ProductNotFoundException(id));

        mockMvc.perform(get("/api/v1/products/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Product Not Found"));
    }

    @Test
    void listReturns200WithoutAuthentication() throws Exception {

        when(productService.findAll(any(), any(), any(), any()))
                .thenReturn(org.springframework.data.domain.Page.empty());

        // No Authorization header is sent - the API is unauthenticated.
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk());
    }

    @Test
    void updateReturns200() throws Exception {

        String id = "68c35e7ca14cbf72660ad546";

        when(productService.update(eq(id), any()))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(put("/api/v1/products/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validBody())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    void deleteReturns204() throws Exception {

        String id = "68c35e7ca14cbf72660ad547";

        mockMvc.perform(delete("/api/v1/products/{id}", id))
                .andExpect(status().isNoContent());
    }
}