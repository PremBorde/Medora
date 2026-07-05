package com.medora.patient.dto;

import java.time.LocalDate;

public record UpdatePatientRequest(
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String gender,
        String phoneNumber,
        String allergies,
        String chronicConditions,
        String currentMedications,
        String bloodType,
        Double heightCm,
        Double weightKg,
        Boolean hasSeenTour
) {}
