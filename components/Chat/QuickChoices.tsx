'use client';

interface QuickChoice {
  label: string;
  value: string;
}

interface Props {
  options: QuickChoice[];
  disabled?: boolean;
  onSelect: (value: string) => void;
}

export function QuickChoices({ options, disabled = false, onSelect }: Props) {
  return (
    <div className="choice-cluster mt-4">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(option.value)}
          className="choice-chip disabled:cursor-not-allowed disabled:opacity-35"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
