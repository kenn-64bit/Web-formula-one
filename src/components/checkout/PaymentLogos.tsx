/* eslint-disable @next/next/no-img-element -- static local logo strip, no optimization needed */

const METHODS = [
  { src: "/payment/visa.svg", label: "Visa" },
  { src: "/payment/mastercard.svg", label: "Mastercard" },
  { src: "/payment/gcash.svg", label: "GCash" },
  { src: "/payment/grabpay.svg", label: "GrabPay" },
  { src: "/payment/maya.svg", label: "Maya" },
  { src: "/payment/bpi.svg", label: "BPI" },
  { src: "/payment/unionbank.svg", label: "UnionBank" },
  { src: "/payment/chinabank.svg", label: "China Bank" },
  { src: "/payment/rcbc.svg", label: "RCBC" },
  { src: "/payment/jcb.svg", label: "JCB" },
];

/** "WE ACCEPT" card — light panel so the brand marks keep their real colors. */
export function PaymentLogos() {
  return (
    <div className="rounded-md bg-white p-4">
      <p className="mono-label text-[10px] tracking-[0.12em] text-ink-900/70">
        We accept
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
        {METHODS.map((m) => (
          <img
            key={m.label}
            src={m.src}
            alt={m.label}
            className="h-6 w-auto"
          />
        ))}
      </div>
    </div>
  );
}
