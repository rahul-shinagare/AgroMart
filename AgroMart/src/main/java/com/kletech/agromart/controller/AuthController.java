package com.kletech.agromart.controller;

import com.kletech.agromart.dto.LoginRequest;
import com.kletech.agromart.model.ApprovalStatus;
import com.kletech.agromart.dto.LoginResponse;
import com.kletech.agromart.model.User;
import com.kletech.agromart.repository.UserRepository;
import com.kletech.agromart.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user =
                userRepository.findByEmail(
                        request.getEmail()
                );

        // User does not exist
        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        // Plain-text comparison for now.
        // BCrypt can be added later.
        if (!user.getPassword().equals(
                request.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
        
        // Check whether Admin has approved the account
        if (user.getApprovalStatus() != ApprovalStatus.APPROVED) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Your account is waiting for Admin approval.");

        }

        // Generate JWT
        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        LoginResponse response =
                new LoginResponse(
                        token,
                        user.getEmail(),
                        user.getRole().name()
                );

        return ResponseEntity.ok(response);
    }
}