import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * Procedural scenic backgrounds for share cards — drawn, not photographed,
 * so there is zero licensing risk.
 */
export type SceneId = 'sunrise' | 'leaves' | 'sea' | 'stars';

export const sceneIds: SceneId[] = ['sunrise', 'leaves', 'sea', 'stars'];

export function Scene({ id, width, height }: { id: SceneId; width: number; height: number }) {
  const props = { width, height, viewBox: '0 0 540 960', preserveAspectRatio: 'xMidYMid slice' as const };
  switch (id) {
    case 'sunrise':
      return (
        <Svg {...props}>
          <Defs>
            <SvgGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#f6e3c8" />
              <Stop offset="0.55" stopColor="#fdeed3" />
              <Stop offset="1" stopColor="#e9e6da" />
            </SvgGradient>
          </Defs>
          <Path d="M0 0h540v960H0Z" fill="url(#sky)" />
          <Circle cx="270" cy="430" r="120" fill="#e9c349" opacity={0.55} />
          <Circle cx="270" cy="430" r="78" fill="#fed65b" opacity={0.8} />
          <Path d="M0 560 Q140 470 300 545 T540 520 V960 H0 Z" fill="#a9b58c" opacity={0.55} />
          <Path d="M0 640 Q170 560 330 630 T540 600 V960 H0 Z" fill="#7c8460" opacity={0.6} />
          <Path d="M0 740 Q200 660 540 720 V960 H0 Z" fill="#5a6043" opacity={0.7} />
        </Svg>
      );
    case 'leaves':
      return (
        <Svg {...props}>
          <Path d="M0 0h540v960H0Z" fill="#eef0e4" />
          {[
            { x: 60, y: 120, r: -28, s: 1.2 },
            { x: 470, y: 90, r: 34, s: 1 },
            { x: 500, y: 820, r: -18, s: 1.35 },
            { x: 70, y: 860, r: 22, s: 1.1 },
            { x: 510, y: 460, r: 8, s: 0.8 },
            { x: 30, y: 480, r: -12, s: 0.75 },
          ].map((leaf, i) => (
            <Path
              key={i}
              d="M0 0 C40 -52 108 -52 132 0 C108 52 40 52 0 0 Z"
              fill={i % 2 === 0 ? '#7c8460' : '#a9b58c'}
              opacity={0.5}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}
            />
          ))}
        </Svg>
      );
    case 'sea':
      return (
        <Svg {...props}>
          <Defs>
            <SvgGradient id="seaSky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#dfe7ee" />
              <Stop offset="1" stopColor="#f4f2ea" />
            </SvgGradient>
          </Defs>
          <Path d="M0 0h540v960H0Z" fill="url(#seaSky)" />
          <Circle cx="400" cy="300" r="58" fill="#fed65b" opacity={0.6} />
          <Path d="M0 520 Q135 495 270 520 T540 520 V960 H0 Z" fill="#8293b5" opacity={0.45} />
          <Path d="M0 600 Q135 575 270 600 T540 600 V960 H0 Z" fill="#4e5f7e" opacity={0.45} />
          <Path d="M0 700 Q135 672 270 700 T540 700 V960 H0 Z" fill="#3a4b68" opacity={0.55} />
          <Path d="M0 820 Q135 795 270 820 T540 820 V960 H0 Z" fill="#1a2b48" opacity={0.5} />
        </Svg>
      );
    case 'stars':
      return (
        <Svg {...props}>
          <Defs>
            <SvgGradient id="night" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#031632" />
              <Stop offset="1" stopColor="#1a2b48" />
            </SvgGradient>
          </Defs>
          <Path d="M0 0h540v960H0Z" fill="url(#night)" />
          {[
            [60, 120, 2.4], [140, 70, 1.6], [230, 150, 2], [330, 60, 1.6], [430, 130, 2.4],
            [500, 220, 1.6], [90, 260, 1.6], [380, 250, 2], [180, 330, 1.6], [480, 360, 1.6],
            [50, 700, 1.6], [150, 800, 2], [300, 740, 1.6], [420, 830, 2.4], [510, 700, 1.6],
            [240, 880, 1.6], [80, 900, 2],
          ].map(([x, y, r], i) => (
            <Circle key={i} cx={x} cy={y} r={r} fill="#f2f1ed" opacity={0.85} />
          ))}
          <Circle cx="270" cy="200" r="7" fill="#fed65b" />
          <Path d="M270 168v64M238 200h64" stroke="#fed65b" strokeWidth="2.4" opacity={0.85} />
          <Path d="M250 180l40 40M290 180l-40 40" stroke="#fed65b" strokeWidth="1.4" opacity={0.5} />
        </Svg>
      );
  }
}

/* ─── Decorative elements for style-based cards ─── */

export function QuoteMarks({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size * 0.7} viewBox="0 0 120 84" fill="none">
      <Path
        d="M0 84V48C0 32 4 20 12 12S30 0 48 0v24c-8 0-14.7 2-20 6S20 40 20 48h16v36H0Z"
        fill={color}
        opacity={0.15}
      />
      <Path
        d="M52 84V48c0-16 4-28 12-36S82 0 100 0v24c-8 0-14.7 2-20 6s-8 10-8 18h16v36H52Z"
        fill={color}
        opacity={0.15}
      />
    </Svg>
  );
}

export function CornerFlourishes({ color }: { color: string }) {
  return (
    <Svg width="540" height="960" viewBox="0 0 540 960" fill="none">
      <Path d="M40 40 L120 40 M40 40 L40 120" stroke={color} strokeWidth="1.5" opacity={0.2} />
      <Path d="M500 40 L420 40 M500 40 L500 120" stroke={color} strokeWidth="1.5" opacity={0.2} />
      <Path d="M40 920 L120 920 M40 920 L40 840" stroke={color} strokeWidth="1.5" opacity={0.2} />
      <Path d="M500 920 L420 920 M500 920 L500 840" stroke={color} strokeWidth="1.5" opacity={0.2} />
      {[120, 160, 200].map((x) => (
        <Circle key={x} cx={x} cy={40} r={2} fill={color} opacity={0.15} />
      ))}
      {[420, 380, 340].map((x) => (
        <Circle key={x} cx={x} cy={40} r={2} fill={color} opacity={0.15} />
      ))}
      {[120, 160, 200].map((x) => (
        <Circle key={x} cx={x} cy={920} r={2} fill={color} opacity={0.15} />
      ))}
      {[420, 380, 340].map((x) => (
        <Circle key={x} cx={x} cy={920} r={2} fill={color} opacity={0.15} />
      ))}
    </Svg>
  );
}

export function DividerLine({ color }: { color: string }) {
  return (
    <Svg width="200" height="20" viewBox="0 0 200 20" fill="none">
      <Path d="M0 10 L80 10" stroke={color} strokeWidth="1" opacity={0.25} />
      <Circle cx="100" cy="10" r="3" fill={color} opacity={0.25} />
      <Path d="M120 10 L200 10" stroke={color} strokeWidth="1" opacity={0.25} />
    </Svg>
  );
}

export function MinimalBorder({ color }: { color: string }) {
  return (
    <Svg width="540" height="960" viewBox="0 0 540 960" fill="none">
      <Rect x="28" y="28" width="484" height="904" rx="4" stroke={color} strokeWidth="0.5" opacity={0.12} />
    </Svg>
  );
}

export function RichBorder({ color }: { color: string }) {
  return (
    <Svg width="540" height="960" viewBox="0 0 540 960" fill="none">
      <Rect x="20" y="20" width="500" height="920" rx="8" stroke={color} strokeWidth="2" opacity={0.2} />
      <Rect x="28" y="28" width="484" height="904" rx="6" stroke={color} strokeWidth="0.5" opacity={0.1} />
      <Path d="M60 20 L60 60 M20 60 L60 60" stroke={color} strokeWidth="1.5" opacity={0.15} />
      <Path d="M480 20 L480 60 M520 60 L480 60" stroke={color} strokeWidth="1.5" opacity={0.15} />
      <Path d="M60 940 L60 900 M20 900 L60 900" stroke={color} strokeWidth="1.5" opacity={0.15} />
      <Path d="M480 940 L480 900 M520 900 L480 900" stroke={color} strokeWidth="1.5" opacity={0.15} />
      {[0.15, 0.1, 0.08].map((op, i) => {
        const s = 4 - i * 1.2;
        return (
          <Circle
            key={i}
            cx={270}
            cy={480}
            r={s}
            fill={color}
            opacity={op}
          />
        );
      })}
    </Svg>
  );
}
