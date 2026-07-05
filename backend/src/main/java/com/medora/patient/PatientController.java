package com.medora.patient;

import com.medora.patient.dto.PatientDto;
import com.medora.patient.dto.UpdatePatientRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/me")
    public ResponseEntity<PatientDto> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        PatientDto patient = patientService.getPatientByEmail(userDetails.getUsername());
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/me")
    public ResponseEntity<PatientDto> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdatePatientRequest request
    ) {
        PatientDto updated = patientService.updatePatient(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }
}
