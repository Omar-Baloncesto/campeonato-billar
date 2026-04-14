export function TrophyBadge({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className="drop-shadow-2xl"
    >
      {/* Outer decorative ring */}
      <circle
        cx="60"
        cy="60"
        r="57"
        stroke="url(#trophy-grad-outer)"
        strokeWidth="2"
      />
      <circle
        cx="60"
        cy="60"
        r="53"
        stroke="url(#trophy-grad-outer)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Inner golden disc */}
      <circle cx="60" cy="60" r="50" fill="url(#trophy-grad-bg)" />

      {/* Laurel wreath left */}
      <path
        d="M25 75c5-20 10-35 20-45 C35 40 28 55 25 75z"
        fill="url(#trophy-grad-leaf)"
        opacity="0.6"
      />
      <path
        d="M28 70c4-15 8-28 15-38 C35 40 30 52 28 70z"
        fill="url(#trophy-grad-leaf)"
        opacity="0.4"
      />

      {/* Laurel wreath right */}
      <path
        d="M95 75c-5-20-10-35-20-45 C85 40 92 55 95 75z"
        fill="url(#trophy-grad-leaf)"
        opacity="0.6"
      />
      <path
        d="M92 70c-4-15-8-28-15-38 C85 40 90 52 92 70z"
        fill="url(#trophy-grad-leaf)"
        opacity="0.4"
      />

      {/* Trophy cup */}
      <path
        d="M44 35h32v6c0 10-6 18-16 22-10-4-16-12-16-22v-6z"
        fill="url(#trophy-grad-cup)"
        stroke="#F5B800"
        strokeWidth="1.5"
      />
      {/* Left handle */}
      <path
        d="M38 37h-5c0 8 4 13 11 15v-2c-4-2-6-7-6-13z"
        fill="#F5B800"
        opacity="0.8"
      />
      {/* Right handle */}
      <path
        d="M82 37h5c0 8-4 13-11 15v-2c4-2 6-7 6-13z"
        fill="#F5B800"
        opacity="0.8"
      />
      {/* Stem */}
      <rect x="56" y="63" width="8" height="7" rx="2" fill="#F5B800" />
      {/* Base */}
      <rect x="49" y="70" width="22" height="5" rx="2.5" fill="#F5B800" />
      <rect
        x="45"
        y="75"
        width="30"
        height="4"
        rx="2"
        fill="#F5B800"
        opacity="0.7"
      />

      {/* Star on cup */}
      <polygon
        points="60,40 62,46 68,46 63,50 65,56 60,52 55,56 57,50 52,46 58,46"
        fill="#1a1a2e"
        opacity="0.5"
      />

      {/* Number 1 */}
      <text
        x="60"
        y="94"
        textAnchor="middle"
        fill="#F5B800"
        fontSize="14"
        fontWeight="900"
        fontFamily="system-ui"
      >
        1
      </text>

      <defs>
        <linearGradient
          id="trophy-grad-outer"
          x1="0"
          y1="0"
          x2="120"
          y2="120"
        >
          <stop offset="0%" stopColor="#F5B800" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient
          id="trophy-grad-bg"
          x1="10"
          y1="10"
          x2="110"
          y2="110"
        >
          <stop offset="0%" stopColor="rgba(245,184,0,0.12)" />
          <stop offset="50%" stopColor="rgba(255,215,0,0.08)" />
          <stop offset="100%" stopColor="rgba(184,134,11,0.12)" />
        </linearGradient>
        <linearGradient
          id="trophy-grad-cup"
          x1="44"
          y1="35"
          x2="76"
          y2="63"
        >
          <stop offset="0%" stopColor="rgba(245,184,0,0.3)" />
          <stop offset="100%" stopColor="rgba(245,184,0,0.1)" />
        </linearGradient>
        <linearGradient
          id="trophy-grad-leaf"
          x1="25"
          y1="30"
          x2="45"
          y2="75"
        >
          <stop offset="0%" stopColor="#F5B800" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MedalBadge({
  position,
  size = 40,
}: {
  position: 1 | 2 | 3 | 4;
  size?: number;
}) {
  const colors = {
    1: { main: '#F5B800', light: 'rgba(245,184,0,0.15)', text: '#F5B800' },
    2: { main: '#C0C0C0', light: 'rgba(192,192,192,0.15)', text: '#C0C0C0' },
    3: { main: '#CD7F32', light: 'rgba(205,127,50,0.15)', text: '#CD7F32' },
    4: { main: '#888888', light: 'rgba(136,136,136,0.15)', text: '#888888' },
  };
  const c = colors[position];

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke={c.main} strokeWidth="2" />
      <circle cx="20" cy="20" r="15" fill={c.light} />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill={c.text}
        fontSize="14"
        fontWeight="900"
        fontFamily="system-ui"
      >
        {position}
      </text>
    </svg>
  );
}
