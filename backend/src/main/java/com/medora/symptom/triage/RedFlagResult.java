package com.medora.symptom.triage;

import java.util.List;

/**
 * Immutable result produced by {@link TriageRuleEngine#evaluate}.
 *
 * @param triggered {@code true} when at least one red-flag rule matched
 * @param reasons   Human-readable descriptions of each matched rule
 */
public record RedFlagResult(boolean triggered, List<String> reasons) {

    /** Convenience factory for a clean (no red-flag) result. */
    public static RedFlagResult clean() {
        return new RedFlagResult(false, List.of());
    }
}
