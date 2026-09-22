import { site } from "../content";
export function Brand() {
  return (
    <a className="brand" href="#top" aria-label={`${site.name} home`}>
      <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M3 27V5h6l7 10L23 5h6v22h-6V15l-7 10-7-10v12Z"
          fill="currentColor"
        />
      </svg>
      <span>
        {site.name}
        <span className="lime">.</span>
      </span>
    </a>
  );
}
