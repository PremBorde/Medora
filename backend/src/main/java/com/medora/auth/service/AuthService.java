package com.medora.auth.service;

import com.medora.auth.dto.JwtResponse;
import com.medora.auth.dto.LoginRequest;
import com.medora.auth.dto.RegisterRequest;
import com.medora.common.exception.ConflictException;
import com.medora.patient.entity.Patient;
import com.medora.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (patientRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        Patient patient = Patient.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        patientRepository.save(patient);

        String token = jwtService.generateToken(patient);
        return new JwtResponse(token, patient.getEmail(), patient.getFirstName(), patient.getLastName());
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        Patient patient = patientRepository.findByEmail(request.email())
                .orElseThrow();

        String token = jwtService.generateToken(patient);
        return new JwtResponse(token, patient.getEmail(), patient.getFirstName(), patient.getLastName());
    }
}
