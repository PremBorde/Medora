'use client';

import LocationRefineMap from './LocationRefineMap';
import SeverityScaleSlider from './SeverityScaleSlider';
import IconChoiceChips from './IconChoiceChips';
import DurationChips from './DurationChips';
import YesNoButtons from './YesNoButtons';
import FreeTextReply from './FreeTextReply';

export default function ClarificationRenderer({ questionData, onSubmitAnswer }) {
  if (!questionData) return null;

  const {
    questionType,
    parentRegion,
    subRegions,
    minSeverity,
    maxSeverity,
    minLabel,
    maxLabel,
    quickReplyOptions,
    iconOptions,
    placeholder
  } = questionData;

  switch (questionType) {
    case 'LOCATION_REFINE':
      return (
        <LocationRefineMap
          parentRegion={parentRegion}
          subRegions={subRegions}
          onSubmit={onSubmitAnswer}
        />
      );
    case 'SEVERITY_SCALE':
      return (
        <SeverityScaleSlider
          min={minSeverity}
          max={maxSeverity}
          minLabel={minLabel}
          maxLabel={maxLabel}
          onSubmit={onSubmitAnswer}
        />
      );
    case 'ICON_CHOICE':
      return (
        <IconChoiceChips
          options={iconOptions}
          onSubmit={onSubmitAnswer}
        />
      );
    case 'DURATION_PICK':
      return (
        <DurationChips
          options={quickReplyOptions}
          onSubmit={onSubmitAnswer}
        />
      );
    case 'YES_NO':
      return (
        <YesNoButtons
          onSubmit={onSubmitAnswer}
        />
      );
    case 'FREE_TEXT':
      return (
        <FreeTextReply
          placeholder={placeholder}
          onSubmit={onSubmitAnswer}
        />
      );
    default:
      // Fallback chip/text selector if questionType is unknown
      return (
        <DurationChips
          options={quickReplyOptions}
          onSubmit={onSubmitAnswer}
        />
      );
  }
}
