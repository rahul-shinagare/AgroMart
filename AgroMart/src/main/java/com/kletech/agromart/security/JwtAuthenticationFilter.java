package com.kletech.agromart.security;

import com.kletech.agromart.model.User;
import com.kletech.agromart.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        // No Authorization header
        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        try {

            // Remove "Bearer "
            String token =
                    authHeader.substring(7);

            // Validate token
            if (!jwtService.isTokenValid(token)) {

                filterChain.doFilter(request, response);
                return;
            }

            // Get email from JWT
            String email =
                    jwtService.extractEmail(token);

            // Find user in database
            User user =
                    userRepository.findByEmail(email);

            if (user == null) {

                filterChain.doFilter(request, response);
                return;
            }

            /*
             * Convert:
             *
             * FARMER -> ROLE_FARMER
             * BUYER  -> ROLE_BUYER
             * ADMIN  -> ROLE_ADMIN
             */
            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority(
                            "ROLE_" +
                            user.getRole().name()
                    );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            List.of(authority)
                    );

            // Tell Spring Security who is logged in
            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

        } catch (Exception e) {

            SecurityContextHolder
                    .clearContext();
        }

        filterChain.doFilter(request, response);
    }
}