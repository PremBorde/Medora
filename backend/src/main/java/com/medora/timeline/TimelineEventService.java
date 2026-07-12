package com.medora.timeline;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TimelineEventService {
    private final TimelineEventRepository timelineEventRepository;

    public List<TimelineEvent> getPatientTimeline(UUID patientId) {
        return timelineEventRepository.findByPatientIdOrderByEventDateDesc(patientId);
    }

    @Transactional
    public TimelineEvent createEvent(UUID patientId, TimelineEvent event) {
        event.setPatientId(patientId);
        if (event.getEventDate() == null) {
            event.setEventDate(LocalDate.now());
        }
        return timelineEventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(UUID patientId, UUID eventId) {
        timelineEventRepository.findById(eventId).ifPresent(event -> {
            if (event.getPatientId().equals(patientId)) {
                timelineEventRepository.delete(event);
            }
        });
    }

    @Transactional
    public TimelineEvent logSymptomCheck(UUID patientId, String symptoms, String urgencyLevel, String specialistType) {
        // Truncate long symptoms to prevent description overflow
        String summary = symptoms.length() > 80 ? symptoms.substring(0, 77) + "..." : symptoms;
        return timelineEventRepository.save(TimelineEvent.builder()
                .patientId(patientId)
                .eventDate(LocalDate.now())
                .eventType("SYMPTOM_CHECK")
                .title("Symptom Check: " + (specialistType != null ? specialistType : "General Practitioner"))
                .description("Analyzed: \"" + summary + "\". Urgency level: " + urgencyLevel)
                .severity(urgencyLevel)
                .metadata("{\"urgencyLevel\":\"" + urgencyLevel + "\",\"specialistType\":\"" + specialistType + "\"}")
                .build());
    }

    @Transactional
    public TimelineEvent logReportUpload(UUID patientId, UUID reportId, String fileName, String summary) {
        String desc = summary != null && summary.length() > 100 ? summary.substring(0, 97) + "..." : summary;
        return timelineEventRepository.save(TimelineEvent.builder()
                .patientId(patientId)
                .eventDate(LocalDate.now())
                .eventType("REPORT_UPLOAD")
                .title("Report Uploaded: " + fileName)
                .description("AI Summary: " + (desc != null ? desc : "No summary available"))
                .severity("LOW")
                .metadata("{\"reportId\":\"" + reportId + "\",\"fileName\":\"" + fileName + "\"}")
                .build());
    }
}
