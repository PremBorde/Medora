package com.medora.timeline;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "timeline_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_type", nullable = false)
    private String eventType; // SYMPTOM_CHECK, REPORT_UPLOAD, MANUAL_LOG, APPOINTMENT

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String severity; // LOW, MEDIUM, HIGH, EMERGENCY

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON links (e.g. {"reportId": "uuid"} or {"symptoms": "text"})
}
