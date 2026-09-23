import { ArrowUpRight } from "lucide-react";
import { contactEmailUrl, site } from "../content";

export function BookingLink({ className }: { className: string }) {
  return (
    <a
      className={className}
      href={site.bookingUrl || contactEmailUrl}
      target={site.bookingUrl ? "_blank" : undefined}
      rel={site.bookingUrl ? "noopener noreferrer" : undefined}
    >
      {site.bookingUrl ? "Book a call" : "Let’s talk"} <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
