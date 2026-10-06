import { ArrowUpRight } from "lucide-react";

export function BookingLink({ className }: { className: string }) {
  return (
    <a className={className} href="/book">
      Book a conversation <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
