// frontend/src/components/common/Input.js
'use client';

export default function Input({
  label,
  id,
  type = 'text',
  error = '',
  required = false,
  options = [],
  className = '',
  ...props
}) {
  // Height: 36-40px. Padding: 8-10px horizontal. Border: 1px solid. Border radius: 4px.
  const baseInputStyle = 'w-full px-2.5 h-[38px] rounded-[4px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/70 placeholder:italic outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const textareaStyle = 'min-h-[100px] h-auto py-2 resize-y';

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {/* Label: Above input, 13px semi-bold, 4px margin bottom */}
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-1 block">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </label>
      )}

      {/* Input element */}
      {type === 'textarea' ? (
        <textarea
          id={id}
          className={`${baseInputStyle} ${textareaStyle}`}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          className={baseInputStyle}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className={baseInputStyle}
          {...props}
        />
      )}

      {/* Error Message */}
      {error && (
        <span className="text-xs text-[var(--color-error)] font-medium mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
}
