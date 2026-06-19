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
  const baseInputStyle = 'w-full px-4 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-500 placeholder:italic outline-none transition-all duration-150 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const textareaStyle = 'min-h-[100px] resize-y';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-zinc-350 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Control element */}
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
            <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white">
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
        <span className="text-xs text-red-400 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
