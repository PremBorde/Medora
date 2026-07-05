package com.medora.patient;

import com.medora.common.exception.ResourceNotFoundException;
import com.medora.patient.dto.PatientDto;
import com.medora.patient.dto.UpdatePatientRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService implements UserDetailsService {

    private final PatientRepository patientRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Patient not found: " + email));
    }

    @Transactional(readOnly = true)
    public PatientDto getPatientByEmail(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return toDto(patient);
    }

    @Transactional
    public PatientDto updatePatient(String email, UpdatePatientRequest request) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (request.firstName() != null) patient.setFirstName(request.firstName());
        if (request.lastName() != null) patient.setLastName(request.lastName());
        if (request.dateOfBirth() != null) patient.setDateOfBirth(request.dateOfBirth());
        if (request.gender() != null) patient.setGender(request.gender());
        if (request.phoneNumber() != null) patient.setPhoneNumber(request.phoneNumber());
        if (request.allergies() != null) patient.setAllergies(request.allergies());
        if (request.chronicConditions() != null) patient.setChronicConditions(request.chronicConditions());
        if (request.currentMedications() != null) patient.setCurrentMedications(request.currentMedications());
        if (request.bloodType() != null) patient.setBloodType(request.bloodType());
        if (request.heightCm() != null) patient.setHeightCm(request.heightCm());
        if (request.weightKg() != null) patient.setWeightKg(request.weightKg());
        if (request.hasSeenTour() != null) patient.setHasSeenTour(request.hasSeenTour());

        Patient saved = patientRepository.save(patient);
        return toDto(saved);
    }

    public PatientDto toDto(Patient patient) {
        return new PatientDto(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getPhoneNumber(),
                patient.getAllergies(),
                patient.getChronicConditions(),
                patient.getCurrentMedications(),
                patient.getBloodType(),
                patient.getHeightCm(),
                patient.getWeightKg(),
                patient.isHasSeenTour()
        );
    }
}
