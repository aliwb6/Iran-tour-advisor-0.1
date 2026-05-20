// Custom YES / NO toggle. Animated, accessible, RTL-aware.
export default function ToggleSwitch({ checked, onChange, disabled = false, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && <p className="font-body text-sm font-medium text-foreground">{label}</p>}
          {description && (
            <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-[58px] h-7 rounded-full flex-shrink-0 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked
            ? 'bg-accent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
            : 'bg-muted/80'
        }`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? 'left-[34px]' : 'left-1'
          }`}
        />
        <span
          className={`absolute top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider transition-opacity ${
            checked ? 'left-2 text-white' : 'right-2 text-muted-foreground'
          }`}
        >
          {checked ? 'Yes' : 'No'}
        </span>
      </button>
    </div>
  );
}
