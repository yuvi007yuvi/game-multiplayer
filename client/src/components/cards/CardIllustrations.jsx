import React from 'react';

/**
 * Royal Court SVG Illustrations & Pips for Call Break Arena cards.
 * Inspired by classic French / Bicycle casino playing card designs.
 */

// Ornate Ace of Spades & Royal Aces
export function AceArt({ suit, color, isTrump }) {
  if (isTrump) {
    return (
      <div className="relative flex items-center justify-center w-full h-full p-2">
        <svg viewBox="0 0 100 120" className="w-16 h-20 sm:w-20 sm:h-24 drop-shadow-md">
          <defs>
            <linearGradient id="goldAceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          {/* Outer filigree flourish */}
          <path
            d="M50 10 C35 35 15 55 15 75 C15 95 32 105 45 98 L42 112 L58 112 L55 98 C68 105 85 95 85 75 C85 55 65 35 50 10 Z"
            fill="#0f172a"
            stroke="#d4af37"
            strokeWidth="2.5"
          />
          {/* Inner royal emblem */}
          <path
            d="M50 25 C40 45 28 60 28 73 C28 85 40 92 48 88 L46 98 L54 98 L52 88 C60 92 72 85 72 73 C72 60 60 45 50 25 Z"
            fill="#1e293b"
            stroke="#fef08a"
            strokeWidth="1"
          />
          {/* Crown on spade */}
          <path
            d="M42 48 L45 56 L50 50 L55 56 L58 48 L58 60 L42 60 Z"
            fill="#d4af37"
          />
          <circle cx="50" cy="45" r="2" fill="#fbbf24" />
          <circle cx="42" cy="47" r="1.5" fill="#fbbf24" />
          <circle cx="58" cy="47" r="1.5" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  // Hearts, Diamonds, Clubs Aces
  const symbolMap = { H: '♥', D: '♦', C: '♣' };
  return (
    <div className="flex items-center justify-center w-full h-full p-1">
      <svg viewBox="0 0 80 100" className="w-12 h-16 sm:w-16 sm:h-20 select-none pointer-events-none">
        <circle cx="40" cy="50" r="24" fill="none" stroke={color} strokeWidth="0.8" opacity="0.2" strokeDasharray="3,3" />
        <text
          x="40"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="34"
          fill={color}
          fontFamily="serif"
        >
          {symbolMap[suit]}
        </text>
      </svg>
    </div>
  );
}

// King Court Illustration (Bearded monarch with golden crown & robes)
export function KingIllustration({ suit, color }) {
  const suitSymbol = { S: '♠', H: '♥', D: '♦', C: '♣' }[suit];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
      <svg viewBox="0 0 100 130" className="w-full h-full max-w-[85px] max-h-[110px]">
        <defs>
          <linearGradient id={`kg-bg-${suit}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* Ornate border frame */}
        <rect x="5" y="5" width="90" height="120" rx="6" fill={`url(#kg-bg-${suit})`} stroke="#b45309" strokeWidth="1.5" />
        <rect x="8" y="8" width="84" height="114" rx="4" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="2,2" />

        {/* King Robes / Shoulders */}
        <path d="M15 120 C15 85 30 75 50 75 C70 75 85 85 85 120 Z" fill={color} opacity="0.85" />
        {/* Ermine / Golden Collar */}
        <path d="M30 80 L50 95 L70 80 L62 75 L50 82 L38 75 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />

        {/* Royal Scepter / Sword on side */}
        <line x1="22" y1="65" x2="22" y2="115" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
        <polygon points="22,60 25,65 19,65" fill="#f59e0b" />
        <circle cx="22" cy="72" r="3" fill="#dc2626" />

        {/* King Head & Face */}
        <circle cx="50" cy="52" r="14" fill="#fed7aa" stroke="#9a3412" strokeWidth="0.8" />
        {/* Crown */}
        <path d="M36 42 L39 30 L45 36 L50 26 L55 36 L61 30 L64 42 Z" fill="#d4af37" stroke="#78350f" strokeWidth="1" />
        <rect x="36" y="40" width="28" height="4" fill="#b45309" />
        {/* Jewels on Crown */}
        <circle cx="50" cy="39" r="1.5" fill="#dc2626" />
        <circle cx="43" cy="39" r="1.2" fill="#2563eb" />
        <circle cx="57" cy="39" r="1.2" fill="#2563eb" />

        {/* Eyes & Mustache & Beard */}
        <circle cx="45" cy="50" r="1.2" fill="#1e293b" />
        <circle cx="55" cy="50" r="1.2" fill="#1e293b" />
        {/* Mustache */}
        <path d="M42 56 C46 54 48 57 50 56 C52 57 54 54 58 56 C55 59 45 59 42 56 Z" fill="#78350f" />
        {/* Long Regal Beard */}
        <path d="M43 58 C46 68 54 68 57 58 C55 70 45 70 43 58 Z" fill="#9a3412" />

        {/* Suit Emblem on Chest */}
        <circle cx="50" cy="104" r="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <text x="50" y="108" textAnchor="middle" fontSize="12" fill={color} fontFamily="serif" fontWeight="bold">
          {suitSymbol}
        </text>
      </svg>
    </div>
  );
}

// Queen Court Illustration (Regal queen with jeweled tiara, veil & holding flower)
export function QueenIllustration({ suit, color }) {
  const suitSymbol = { S: '♠', H: '♥', D: '♦', C: '♣' }[suit];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
      <svg viewBox="0 0 100 130" className="w-full h-full max-w-[85px] max-h-[110px]">
        <defs>
          <linearGradient id={`qn-bg-${suit}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* Frame */}
        <rect x="5" y="5" width="90" height="120" rx="6" fill={`url(#qn-bg-${suit})`} stroke="#92400e" strokeWidth="1.5" />
        <rect x="8" y="8" width="84" height="114" rx="4" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="2,2" />

        {/* Queen Gown */}
        <path d="M18 120 C18 85 32 76 50 76 C68 76 82 85 82 120 Z" fill={color} opacity="0.85" />
        {/* Royal necklace / Bodice */}
        <path d="M34 82 C42 94 58 94 66 82 L60 76 C50 82 50 82 40 76 Z" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />

        {/* Queen holding flower/rose */}
        <line x1="76" y1="75" x2="76" y2="110" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="76" cy="72" r="5" fill="#dc2626" />
        <circle cx="76" cy="72" r="2.5" fill="#f87171" />

        {/* Hair / Veil */}
        <path d="M32 46 C30 65 34 78 36 82 C40 72 40 50 40 45 Z" fill="#78350f" />
        <path d="M68 46 C70 65 66 78 64 82 C60 72 60 50 60 45 Z" fill="#78350f" />

        {/* Queen Head */}
        <ellipse cx="50" cy="52" rx="12" ry="14" fill="#fed7aa" stroke="#9a3412" strokeWidth="0.8" />

        {/* Tiara / Crown */}
        <path d="M38 41 L42 32 L47 37 L50 28 L53 37 L58 32 L62 41 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
        <circle cx="50" cy="30" r="1.5" fill="#dc2626" />
        <circle cx="42" cy="34" r="1.2" fill="#3b82f6" />
        <circle cx="58" cy="34" r="1.2" fill="#3b82f6" />

        {/* Eyes & Red Lips */}
        <ellipse cx="46" cy="50" rx="1.5" ry="1" fill="#1e293b" />
        <ellipse cx="54" cy="50" rx="1.5" ry="1" fill="#1e293b" />
        {/* Smile */}
        <path d="M47 57 Q50 60 53 57" stroke="#b91c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Suit Emblem on Gown */}
        <circle cx="50" cy="104" r="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <text x="50" y="108" textAnchor="middle" fontSize="12" fill={color} fontFamily="serif" fontWeight="bold">
          {suitSymbol}
        </text>
      </svg>
    </div>
  );
}

// Jack Court Illustration (Noble knight with feathered cap & halberd)
export function JackIllustration({ suit, color }) {
  const suitSymbol = { S: '♠', H: '♥', D: '♦', C: '♣' }[suit];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
      <svg viewBox="0 0 100 130" className="w-full h-full max-w-[85px] max-h-[110px]">
        <defs>
          <linearGradient id={`jk-bg-${suit}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* Frame */}
        <rect x="5" y="5" width="90" height="120" rx="6" fill={`url(#jk-bg-${suit})`} stroke="#b45309" strokeWidth="1.5" />
        <rect x="8" y="8" width="84" height="114" rx="4" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="2,2" />

        {/* Knight Tunic / Armor */}
        <path d="M16 120 C16 85 30 75 50 75 C70 75 84 85 84 120 Z" fill={color} opacity="0.85" />
        <path d="M32 78 L50 90 L68 78 L58 74 L50 80 L42 74 Z" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="0.8" />

        {/* Halberd / Lance */}
        <line x1="20" y1="50" x2="20" y2="118" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="20,42 25,50 15,50" fill="#94a3b8" stroke="#334155" strokeWidth="0.5" />
        <polygon points="20,48 27,52 20,56" fill="#cbd5e1" />

        {/* Young Jack Head */}
        <circle cx="50" cy="54" r="13" fill="#fed7aa" stroke="#9a3412" strokeWidth="0.8" />

        {/* Feathered Beret / Cap */}
        <path d="M34 45 C34 35 66 35 66 45 Z" fill="#dc2626" />
        <rect x="34" y="43" width="32" height="4" rx="1" fill="#f59e0b" />
        {/* Feather quill */}
        <path d="M60 42 C68 30 74 22 76 18 C70 24 64 34 60 40 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />

        {/* Eyes & Smile */}
        <circle cx="46" cy="52" r="1.3" fill="#1e293b" />
        <circle cx="54" cy="52" r="1.3" fill="#1e293b" />
        <path d="M47 60 Q50 63 53 60" stroke="#78350f" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Suit Emblem on Tunic */}
        <circle cx="50" cy="104" r="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        <text x="50" y="108" textAnchor="middle" fontSize="12" fill={color} fontFamily="serif" fontWeight="bold">
          {suitSymbol}
        </text>
      </svg>
    </div>
  );
}

// Authentic Multi-Pip Layout for Numbered Cards (2 to 10)
// Uses exact vector SVG coordinates ensuring zero overlap on any screen resolution!
export function NumberPips({ rank, suit, color }) {
  const count = parseInt(rank, 10);
  const suitSymbol = { S: '♠', H: '♥', D: '♦', C: '♣' }[suit];

  // Coords in a 70 x 96 SVG viewBox:
  // Left col: X = 18, Center: X = 35, Right col: X = 52
  // Y range: from 16 to 80 (leaves clean margins for indices)
  const getPipPositions = (num) => {
    switch (num) {
      case 2:
        return [
          { x: 35, y: 22 },
          { x: 35, y: 74, inv: true }
        ];
      case 3:
        return [
          { x: 35, y: 20 },
          { x: 35, y: 48 },
          { x: 35, y: 76, inv: true }
        ];
      case 4:
        return [
          { x: 18, y: 22 }, { x: 52, y: 22 },
          { x: 18, y: 74, inv: true }, { x: 52, y: 74, inv: true }
        ];
      case 5:
        return [
          { x: 18, y: 22 }, { x: 52, y: 22 },
          { x: 35, y: 48 },
          { x: 18, y: 74, inv: true }, { x: 52, y: 74, inv: true }
        ];
      case 6:
        return [
          { x: 18, y: 20 }, { x: 52, y: 20 },
          { x: 18, y: 48 }, { x: 52, y: 48 },
          { x: 18, y: 76, inv: true }, { x: 52, y: 76, inv: true }
        ];
      case 7:
        return [
          { x: 18, y: 20 }, { x: 52, y: 20 },
          { x: 35, y: 34 },
          { x: 18, y: 48 }, { x: 52, y: 48 },
          { x: 18, y: 76, inv: true }, { x: 52, y: 76, inv: true }
        ];
      case 8:
        return [
          { x: 18, y: 20 }, { x: 52, y: 20 },
          { x: 35, y: 34 },
          { x: 18, y: 48 }, { x: 52, y: 48 },
          { x: 35, y: 62, inv: true },
          { x: 18, y: 76, inv: true }, { x: 52, y: 76, inv: true }
        ];
      case 9:
        return [
          { x: 18, y: 18 }, { x: 52, y: 18 },
          { x: 18, y: 38 }, { x: 52, y: 38 },
          { x: 35, y: 48 },
          { x: 18, y: 58, inv: true }, { x: 52, y: 58, inv: true },
          { x: 18, y: 78, inv: true }, { x: 52, y: 78, inv: true }
        ];
      case 10:
        return [
          { x: 18, y: 17 }, { x: 52, y: 17 },
          { x: 35, y: 28 },
          { x: 18, y: 37 }, { x: 52, y: 37 },
          { x: 18, y: 59, inv: true }, { x: 52, y: 59, inv: true },
          { x: 35, y: 68, inv: true },
          { x: 18, y: 79, inv: true }, { x: 52, y: 79, inv: true }
        ];
      default:
        return [{ x: 35, y: 48 }];
    }
  };

  const pips = getPipPositions(count);
  const fontSize = count >= 9 ? '11' : (count >= 7 ? '12' : '13');

  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      <svg
        viewBox="0 0 70 96"
        className="w-full h-full max-w-[64px] max-h-[88px]"
      >
        {pips.map((pip, i) => (
          <text
            key={i}
            x={pip.x}
            y={pip.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fill={color}
            fontFamily="serif"
            transform={pip.inv ? `rotate(180, ${pip.x}, ${pip.y})` : undefined}
          >
            {suitSymbol}
          </text>
        ))}
      </svg>
    </div>
  );
}
