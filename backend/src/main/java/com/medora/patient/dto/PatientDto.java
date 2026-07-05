package com.medora.patient.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PatientDto(
        UUID id,
        String firstName,
        String lastName,
        String email,
        LocalDate dateOfBirth,
        String gender,
        String phoneNumber,
        String allergies,
        String chronicConditions,
        String currentMedications,
        String bloodType,
        Double heightCm,
        Double weightKg,
        boolean hasSeenTour
) {}
