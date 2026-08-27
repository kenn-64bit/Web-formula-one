import Link from "next/link";
import { CheckeredDivider } from "@/components/ui/CheckeredDivider";

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Product", links: ["Home", "Spec Sheet", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Docs", "Signal Log", "Status", "API"] },
  { title: "Legal", links: ["Terms", "Privacy", "Risk Notice", "Refunds"] },
];

export function Footer() {
  return (
    <footer className="mt-auto">
      <CheckeredDivider />
      <div className="bg-[#0c0f16]">
        <div className="mx-auto max-w-canvas px-5 py-16 md:px-20">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 opacity-60">
            {["SCUDERIA", "MONZA", "APEX-DYN", "TIFOSI", "PIT-24", "DRS-LINE"].map(
              (mark) => (
                <span
                  key={mark}
                  className="font-display text-lg font-semibold uppercase tracking-widest text-white"
                >
                  {mark}
                </span>
              ),
            )}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mono-label text-[12px] text-text-secondary">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-[13px] text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mono-label mt-12 text-[11px] text-text-secondary">
            © {new Date().getFullYear()} APEX SIGNALS — ALL TELEMETRY RESERVED. NOT
            FINANCIAL ADVICE.
          </p>
        </div>
      </div>
    </footer>
  );
}
