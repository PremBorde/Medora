package com.medora.timeline;

import com.medora.patient.repository.PatientRepository;
import com.medora.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
public class TimelineEventController {
    private final TimelineEventService timelineEventService;
    private final PatientRepository patientRepository;

    private UUID getPatientId(UserDetails userDetails) {
        return patientRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<TimelineEvent>> getTimeline(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID patientId = getPatientId(userDetails);
        List<TimelineEvent> timeline = timelineEventService.getPatientTimeline(patientId);
        return ResponseEntity.ok(timeline);
    }

    @PostMapping
    public ResponseEntity<TimelineEvent> createEvent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TimelineEvent event
    ) {
        UUID patientId = getPatientId(userDetails);
        TimelineEvent created = timelineEventService.createEvent(patientId, event);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ) {
        UUID patientId = getPatientId(userDetails);
        timelineEventService.deleteEvent(patientId, id);
        return ResponseEntity.noContent().build();
    }
}
