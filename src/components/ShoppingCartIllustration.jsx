// A properly-drawn cart, not a generic icon glyph: trapezoid wire basket
// with grid lines, a handle, an axle, and two wheels — plus four "things
// we sell" sitting inside it, colored from the category palette so it
// reads as "groceries in a cart" rather than an abstract shape.
export default function ShoppingCartIllustration({ className }) {
  return (
    <svg viewBox="0 0 220 190" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Items sitting inside the basket, behind the front rim so they read as "in" it */}
      <g>
        <rect x="72" y="48" width="26" height="26" rx="5" fill="#E5484D" transform="rotate(-8 85 61)" />
        <circle cx="112" cy="42" r="15" fill="#E0A030" />
        <rect x="128" y="46" width="22" height="30" rx="10" fill="#2E7D5B" transform="rotate(6 139 61)" />
      </g>

      {/* Basket — trapezoid wire frame */}
      <path
        d="M46 54 H174 L148 122 H72 Z"
        fill="#3FBF6B"
        fillOpacity="0.14"
        stroke="#123D0A"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Vertical grid lines */}
      <path d="M85.5 54 L94.75 122" stroke="#123D0A" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M110 54 L110 122" stroke="#123D0A" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M134.5 54 L125.25 122" stroke="#123D0A" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      {/* Horizontal grid lines */}
      <path d="M63 77 L157 77" stroke="#123D0A" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      <path d="M79.5 100 L140.5 100" stroke="#123D0A" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />

      {/* Handle */}
      <rect x="6" y="18" width="34" height="11" rx="5.5" fill="#123D0A" />
      <path d="M26 24 L48 54" stroke="#123D0A" strokeWidth="5" strokeLinecap="round" />

      {/* Front support strut + axle */}
      <path d="M72 122 L64 150" stroke="#123D0A" strokeWidth="5" strokeLinecap="round" />
      <path d="M148 122 L156 150" stroke="#123D0A" strokeWidth="5" strokeLinecap="round" />

      {/* Wheels */}
      <circle cx="80" cy="164" r="14" fill="#131A15" />
      <circle cx="80" cy="164" r="5" fill="#F4F7F4" />
      <circle cx="150" cy="164" r="14" fill="#131A15" />
      <circle cx="150" cy="164" r="5" fill="#F4F7F4" />
    </svg>
  )
}
