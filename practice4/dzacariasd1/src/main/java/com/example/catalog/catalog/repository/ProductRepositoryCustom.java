package com.example.catalog.catalog.repository;

import com.example.catalog.catalog.entity.Product;
import com.example.catalog.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Fragmento de repositorio para el filtrado dinamico del listado.
 *
 * <p>En la version con PostgreSQL esto lo resolvia
 * {@code JpaSpecificationExecutor} con la API de Criteria de JPA. MongoDB no
 * tiene ese mecanismo, de modo que se declara aqui la operacion y se implementa
 * en {@link ProductRepositoryImpl} armando un {@code Criteria} de Spring Data
 * MongoDB.</p>
 */
public interface ProductRepositoryCustom {

    /**
     * Devuelve una pagina de productos aplicando los filtros opcionales.
     *
     * @param status   estado exacto, o {@code null} para no filtrar
     * @param sku      SKU exacto, o {@code null} para no filtrar
     * @param search   texto libre sobre nombre o descripcion, sin distinguir
     *                 mayusculas; {@code null} para no filtrar
     * @param pageable pagina, tamanio y ordenamiento
     */
    Page<Product> search(ProductStatus status, String sku, String search, Pageable pageable);
}
