import { ArrowUpRight } from "lucide-react";
import { site } from "../content";

export function BookingLink({ className }: { className: string }) {
  return (
    <a
      className={className}
      href={site.bookingUrl || "#contact"}
      target={site.bookingUrl ? "_blank" : undefined}
      rel={site.bookingUrl ? "noopener noreferrer" : undefined}
    >
      Book a call <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
