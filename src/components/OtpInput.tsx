import { useRef, useState } from "react";
import { cleanOtp } from "../lib/audit-journey.mjs";

export function OtpInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState(0);
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={
        "otp-control" +
        (error ? " has-error" : "") +
        (disabled ? " is-disabled" : "")
      }
    >
      <div className="otp-slots" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className={
              (value[i] ? "filled " : "") +
              (focused && selection === i ? "active" : "")
            }
            onPointerDown={(event) => {
              if (disabled) return;
              event.preventDefault();
              const position = Math.min(i, value.length);
              input.current?.focus();
              input.current?.setSelectionRange(
                position,
                Math.min(position + 1, value.length),
              );
              setSelection(position);
            }}
          >
            {value[i] || <i />}
          </span>
        ))}
      </div>
      <input
        ref={input}
        id="audit-code"
        className="otp-native"
        type="text"
        autoFocus
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{8}"
        maxLength={8}
        required
        value={value}
        disabled={disabled}
        aria-invalid={error}
        aria-describedby={error ? "audit-signin-alert" : "otp-help"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSelect={(event) =>
          setSelection(Math.min(event.currentTarget.selectionStart || 0, 7))
        }
        onInvalid={(event) => {
          event.preventDefault();
          input.current?.focus();
        }}
        onChange={(event) => onChange(cleanOtp(event.target.value))}
        onPaste={(event) => {
          const digits = cleanOtp(event.clipboardData.getData("text"));
          if (digits.length === 8) {
            event.preventDefault();
            onChange(digits);
            requestAnimationFrame(() => {
              input.current?.setSelectionRange(8, 8);
              setSelection(7);
            });
          }
        }}
      />
    </div>
  );
}
