package com.shramik.profile;

import com.shramik.profile.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class ShramikProfileApplicationTests {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // Set the development key placeholder property
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", 
            "dGhpcy1pcy1hLXNlY3VyZS0yNTYtYml0LXNlY3JldC1rZXktZm9yLXNocmFtaWstcHJvZmlsZS1hcHBsaWNhdGlvbi1kZXZlbG9wbWVudA==");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000);
    }

    @Test
    void testJwtTokenGenerationAndClaimsParsing() {
        String email = "test_user@shramik.com";
        String userId = "user_123456";
        String role = "TECHNICIAN";

        // Generate token
        String token = jwtUtils.generateToken(email, userId, role);
        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3); // JWT has header, payload, signature

        // Validate token
        assertTrue(jwtUtils.validateToken(token));

        // Parse claims and assert correctness
        assertEquals(email, jwtUtils.getEmailFromToken(token));
        assertEquals(userId, jwtUtils.getUserIdFromToken(token));
        assertEquals(role, jwtUtils.getRoleFromToken(token));
    }
}
