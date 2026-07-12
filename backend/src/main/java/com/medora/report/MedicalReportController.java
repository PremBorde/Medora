package com.medora.report;

import com.medora.patient.repository.PatientRepository;
import com.medora.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class MedicalReportController {
    private final MedicalReportService medicalReportService;
    private final PatientRepository patientRepository;

    private UUID getPatientId(UserDetails userDetails) {
        return patientRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<MedicalReport>> getReports(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID patientId = getPatientId(userDetails);
        List<MedicalReport> reports = medicalReportService.getPatientReports(patientId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalReport> getReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ) {
        UUID patientId = getPatientId(userDetails);
        MedicalReport report = medicalReportService.getReportById(patientId, id);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/upload")
    public ResponseEntity<MedicalReport> uploadReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        UUID patientId = getPatientId(userDetails);
        MedicalReport report = medicalReportService.processReport(patientId, file);
        return ResponseEntity.ok(report);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ) {
        UUID patientId = getPatientId(userDetails);
        medicalReportService.deleteReport(patientId, id);
        return ResponseEntity.noContent().build();
    }
}
