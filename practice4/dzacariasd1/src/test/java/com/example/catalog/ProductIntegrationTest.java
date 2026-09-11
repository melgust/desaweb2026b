package com.example.catalog;

import com.example.catalog.catalog.repository.ProductRepository;
import com.example.catalog.support.AbstractMongoIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Prueba de integracion completa: HTTP -> Controller -> Service -> Repository ->
 * MongoDB (Testcontainers). Verifica ademas que los indices unicos se crean al
 * arrancar y que la API es alcanzable sin cabecera Authorization.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProductIntegrationTest extends AbstractMongoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void cleanUp() {
        productRepository.deleteAll();
    }

    private Map<String, Object> body(String sku, String slug) {
        return Map.of(
                "sku", sku,
                "name", "iPhone " + sku,
                "slug", slug,
                "description", "A phone",
                "price", 999.99,
                "currency", "USD",
                "status", "ACTIVE");
    }

    @Test
    void fullCrudFlowWorksWithoutAuthentication() throws Exception {
        // CREATE - sin cabecera Authorization.
        String created = mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body("SKU-INT", "slug-int"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(created).get("id").asText();

        // READ
        mockMvc.perform(get("/api/v1/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU-INT"));

        // LIST con paginacion y filtro
        mockMvc.perform(get("/api/v1/products")
                        .param("status", "ACTIVE")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "name,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("SKU-INT"));

        // UPDATE
        mockMvc.perform(put("/api/v1/products/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "sku", "SKU-INT",
                                        "name", "iPhone actualizado",
                                        "slug", "slug-int",
                                        "description", "A phone",
                                        "price", 1099.50,
                                        "currency", "USD",
                                        "status", "INACTIVE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("iPhone actualizado"))
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        // DELETE
        mockMvc.perform(delete("/api/v1/products/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/products/{id}", id))
                .andExpect(status().isNotFound());
    }

    /**
     * La segunda alta debe dar 409. Con PostgreSQL lo garantizaba la restriccion
     * UNIQUE de la tabla; aqui lo garantiza el indice unico de la coleccion.
     */
    @Test
    void duplicateSkuReturnsConflict() throws Exception {
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body("DUP", "slug-dup-1"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body("DUP", "slug-dup-2"))))
                .andExpect(status().isConflict());
    }

    @Test
    void validationErrorReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "sku", "",
                                        "name", "Sin SKU",
                                        "slug", "sin-sku",
                                        "price", 10.0,
                                        "currency", "USD",
                                        "status", "ACTIVE"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Failed"));
    }

    @Test
    void listEndpointIsReachableWithoutAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk());
    }
}
