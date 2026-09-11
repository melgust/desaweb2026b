package com.example.catalog.common.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Manejo centralizado de excepciones. Devuelve Problem Details (RFC 9457) y
 * nunca expone trazas de pila a quien consume la API.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ProblemDetail handleNotFound(ProductNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Product Not Found");
        problem.setType(URI.create("urn:catalog:error:product-not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(DuplicateProductException.class)
    public ProblemDetail handleDuplicate(DuplicateProductException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Duplicate Product");
        problem.setType(URI.create("urn:catalog:error:duplicate-product"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "One or more fields are invalid");
        problem.setTitle("Validation Failed");
        problem.setType(URI.create("urn:catalog:error:validation"));
        problem.setProperty("timestamp", Instant.now());

        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> {
                    Map<String, String> error = new LinkedHashMap<>();
                    error.put("field", fieldError.getField());
                    error.put("message", fieldError.getDefaultMessage());
                    return error;
                })
                .toList();
        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolation(ConstraintViolationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "One or more parameters are invalid");
        problem.setTitle("Validation Failed");
        problem.setType(URI.create("urn:catalog:error:validation"));
        problem.setProperty("timestamp", Instant.now());

        List<Map<String, String>> errors = ex.getConstraintViolations().stream()
                .map(violation -> {
                    Map<String, String> error = new LinkedHashMap<>();
                    error.put("field", violation.getPropertyPath().toString());
                    error.put("message", violation.getMessage());
                    return error;
                })
                .toList();
        problem.setProperty("errors", errors);
        return problem;
    }

    /**
     * Violacion de un indice unico de MongoDB (SKU o slug repetidos).
     *
     * <p>Sustituye en la practica al caso que con PostgreSQL disparaba la
     * restriccion {@code UNIQUE} de la tabla. Se declara antes que
     * {@link DataIntegrityViolationException} porque {@code DuplicateKeyException}
     * hereda de ella y Spring elige siempre el manejador mas especifico.</p>
     */
    @ExceptionHandler(DuplicateKeyException.class)
    public ProblemDetail handleDuplicateKey(DuplicateKeyException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "SKU or slug already exists");
        problem.setTitle("Duplicate Key");
        problem.setType(URI.create("urn:catalog:error:duplicate-product"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    /**
     * Dos peticiones intentaron modificar el mismo documento a la vez y la
     * version ({@code @Version}) ya no coincidia.
     */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ProblemDetail handleOptimisticLocking(OptimisticLockingFailureException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "The product was modified by another request; retry with fresh data");
        problem.setTitle("Concurrent Modification");
        problem.setType(URI.create("urn:catalog:error:optimistic-lock"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "The request conflicts with an existing resource");
        problem.setTitle("Data Integrity Violation");
        problem.setType(URI.create("urn:catalog:error:data-integrity"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
