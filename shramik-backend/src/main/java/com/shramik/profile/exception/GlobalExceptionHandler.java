package com.shramik.profile.exception;

import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.connector.ClientAbortException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────────────────────────────────────
    // VIDEO STREAMING — Client-Abort Exceptions (EXPECTED, NOT ERRORS)
    //
    // These fire constantly during normal video playback:
    //   • Browser seeks forward → cancels the current range request
    //   • Browser buffers ahead → drops the connection when done
    //   • User navigates away  → browser aborts all pending requests
    //
    // We intentionally return null here so Spring does NOT try to write
    // a JSON error body over a connection that the browser already closed
    // (which would cause the secondary HttpMessageNotWritableException).
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(ClientAbortException.class)
    public ResponseEntity<Void> handleClientAbort(ClientAbortException ex) {
        // Log at TRACE — this is routine and never actionable
        log.trace("Client closed connection during streaming (seek/navigation): {}", ex.getMessage());
        return null; // no response body — connection is already gone
    }

    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public ResponseEntity<Void> handleAsyncNotUsable(AsyncRequestNotUsableException ex) {
        // Caused by the same client-abort scenario — browser closed connection
        // before Tomcat could finish writing the video range chunk.
        log.trace("Async response unusable — client disconnected mid-stream: {}", ex.getMessage());
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.warn("Validation failure: {}", errors);
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failure: {}", ex.getMessage());
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return new ResponseEntity<>(
            Map.of("error", "Access Denied: You do not have permissions to perform this action."),
            HttpStatus.FORBIDDEN
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOMAIN
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATCH-ALL — genuine unexpected errors only reach here now
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        // ClientAbortException and AsyncRequestNotUsableException are handled
        // above, so this catch-all only sees real application errors now.
        log.error("Unhandled server error: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(
            Map.of("error", "An internal server error occurred: " + ex.getMessage()),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
