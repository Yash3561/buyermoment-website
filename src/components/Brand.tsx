import { site } from "../content";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-mark ${className}`}
      src="/logo.svg"
      width="40"
      height="40"
      alt=""
      aria-hidden="true"
    />
  );
}

export function Brand() {
  return (
    <a className="brand" href="/" aria-label={`${site.name} home`}>
      <BrandMark />
      <span>
        Context<span className="brand-light">Lumen</span>
      </span>
    </a>
  );
}
