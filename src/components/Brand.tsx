import { site } from "../content";
export function Brand() {
  return (
    <a className="brand" href="#top" aria-label={`${site.name} home`}>
      <svg
        className="brand-mark"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M27 10a14 14 0 1 0 0 20"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M22 13v14h11"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 6v6m-3-3h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span>{site.name}</span>
    </a>
  );
}
