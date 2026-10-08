export function AuditSteps({ step }: { step: number }) {
  return (
    <ol className="audit-steps" aria-label="Audit progress">
      {["Website", "Email", "Verify", "Audit", "Report"].map((label, index) => (
        <li
          key={label}
          className={index < step ? "done" : index === step ? "current" : ""}
          aria-current={index === step ? "step" : undefined}
        >
          <span>{index < step ? "✓" : index + 1}</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}
