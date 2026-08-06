package com.kletech.agromart.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kletech.agromart.model.ApprovalStatus;
import com.kletech.agromart.model.User;
import com.kletech.agromart.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ==========================================
    // GET ALL PENDING USERS
    // ==========================================

    @GetMapping("/pending-users")
    public ResponseEntity<List<User>> getPendingUsers() {

        List<User> pendingUsers =
                userRepository.findByApprovalStatus(
                        ApprovalStatus.PENDING);

        return ResponseEntity.ok(pendingUsers);
    }

    // ==========================================
    // APPROVE USER
    // ==========================================

    @PutMapping("/approve-user/{id}")
    public ResponseEntity<?> approveUser(
            @PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }

        user.setApprovalStatus(
                ApprovalStatus.APPROVED);

        userRepository.save(user);

        return ResponseEntity.ok(
                "User approved successfully");
    }

}