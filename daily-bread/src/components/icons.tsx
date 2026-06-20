import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * Icon set per the design system: rounded terminals, consistent 1.5px
 * strokes, soft organic shapes — never sharp or jagged.
 */
export interface IconProps {
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
}

const defaults = { size: 24, color: colors.primary as ColorValue, strokeWidth: 1.5 };

function useIcon(props: IconProps) {
  return { ...defaults, ...props };
}

const stroke = (color: ColorValue, strokeWidth: number) =>
  ({
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  }) as const;

/** Sunrise over a horizon — the Today tab. */
export function SunriseIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7.5 15a4.5 4.5 0 0 1 9 0" {...s} />
      <Line x1="3" y1="15" x2="5" y2="15" {...s} />
      <Line x1="19" y1="15" x2="21" y2="15" {...s} />
      <Line x1="12" y1="5" x2="12" y2="7.5" {...s} />
      <Line x1="5.6" y1="8.6" x2="7" y2="10" {...s} />
      <Line x1="18.4" y1="8.6" x2="17" y2="10" {...s} />
      <Line x1="4" y1="18.5" x2="20" y2="18.5" {...s} />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="5.5" width="16" height="14.5" rx="3" {...s} />
      <Line x1="4" y1="10" x2="20" y2="10" {...s} />
      <Line x1="8.5" y1="3.5" x2="8.5" y2="7" {...s} />
      <Line x1="15.5" y1="3.5" x2="15.5" y2="7" {...s} />
      <Circle cx="12" cy="14.75" r="1.1" fill={color} stroke="none" />
    </Svg>
  );
}

export function ShareIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 14.5V4.5" {...s} />
      <Path d="M8.5 7.5 12 4l3.5 3.5" {...s} />
      <Path d="M6.5 11H6a2 2 0 0 0-2 2v5.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V13a2 2 0 0 0-2-2h-.5" {...s} />
    </Svg>
  );
}

export function MoreIcon(props: IconProps) {
  const { size, color } = useIcon(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="5.5" cy="12" r="1.4" fill={color} />
      <Circle cx="12" cy="12" r="1.4" fill={color} />
      <Circle cx="18.5" cy="12" r="1.4" fill={color} />
    </Svg>
  );
}

export function PlayIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8.5 5.8v12.4c0 .8.9 1.3 1.6.9l9.4-6.2c.6-.4.6-1.4 0-1.8L10.1 4.9c-.7-.4-1.6.1-1.6.9Z" {...s} />
    </Svg>
  );
}

export function StopIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="6.5" y="6.5" width="11" height="11" rx="2.5" {...s} />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m9.5 6 6 6-6 6" {...s} />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m14.5 6-6 6 6 6" {...s} />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" {...s} />
      <Path d="M10.3 19a2 2 0 0 0 3.4 0" {...s} />
    </Svg>
  );
}

export function BookIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 6.5C10.5 5 8.4 4.5 4.5 4.5v14c3.9 0 6 .5 7.5 2 1.5-1.5 3.6-2 7.5-2v-14c-3.9 0-6 .5-7.5 2Z" {...s} />
      <Line x1="12" y1="6.5" x2="12" y2="20.5" {...s} />
    </Svg>
  );
}

/** A music note — worship lyrics. */
export function MusicNoteIcon(props: IconProps) {
  const { size, color } = useIcon(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 17.5V6l11-2v11.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={7} cy={17.5} r={2.5} stroke={color} strokeWidth={1.5} fill="none" />
      <Circle cx={18} cy={15.5} r={2.5} stroke={color} strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

/** A gentle sprout — streaks grow, they never burn. */
export function SproutIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20v-7" {...s} />
      <Path d="M12 13c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6Z" {...s} />
      <Path d="M12 10.5C12 7.5 10 5.5 6.5 5.5c0 3 2 5 5.5 5Z" {...s} />
    </Svg>
  );
}

export function PenIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m5 19 .9-3.6L16.6 4.7a1.8 1.8 0 0 1 2.6 0l.1.1a1.8 1.8 0 0 1 0 2.6L8.6 18.1 5 19Z" {...s} />
      <Line x1="13.5" y1="7.5" x2="16.5" y2="10.5" {...s} />
    </Svg>
  );
}

export function GlobeIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="8.5" {...s} />
      <Path d="M3.5 12h17" {...s} />
      <Path d="M12 3.5c2.3 2.3 3.5 5.2 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.2-3.5-8.5S9.7 5.8 12 3.5Z" {...s} />
    </Svg>
  );
}

export function TypeIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 7V5h14v2" {...s} />
      <Line x1="12" y1="5" x2="12" y2="19" {...s} />
      <Line x1="9" y1="19" x2="15" y2="19" {...s} />
    </Svg>
  );
}

/** A slim cross with rounded terminals — used sparsely for branding. */
export function CrossIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="12" y1="4" x2="12" y2="20" {...s} />
      <Line x1="7" y1="9" x2="17" y2="9" {...s} />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="6.5" y1="6.5" x2="17.5" y2="17.5" {...s} />
      <Line x1="17.5" y1="6.5" x2="6.5" y2="17.5" {...s} />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m5.5 12.5 4 4 9-9" {...s} />
    </Svg>
  );
}

/** A soft shopping bag — the quiet-commerce storefront. */
export function BagIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5.5 8.5h13l-1 11a1.8 1.8 0 0 1-1.8 1.5H8.3a1.8 1.8 0 0 1-1.8-1.5l-1-11Z" {...s} />
      <Path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" {...s} />
    </Svg>
  );
}

/** Hamburger — opens the drawer. */
export function MenuIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="4.5" y1="7" x2="19.5" y2="7" {...s} />
      <Line x1="4.5" y1="12" x2="19.5" y2="12" {...s} />
      <Line x1="4.5" y1="17" x2="14.5" y2="17" {...s} />
    </Svg>
  );
}

/** Two gentle figures — family & church groups. */
export function PeopleIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="9" cy="8.5" r="3" {...s} />
      <Path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...s} />
      <Path d="M15.5 6.2a2.8 2.8 0 1 1 1.6 5.2" {...s} />
      <Path d="M17.5 14.6c1.9.6 3 2.2 3 4.4" {...s} />
    </Svg>
  );
}

/** A little chapel — local Mass & service times. */
export function ChurchIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3v3.5" {...s} />
      <Path d="M10 4.8h4" {...s} />
      <Path d="M7 20.5v-7l5-4 5 4v7" {...s} />
      <Path d="M4 20.5h16" {...s} />
      <Path d="M10.5 20.5v-3a1.5 1.5 0 0 1 3 0v3" {...s} />
    </Svg>
  );
}

/** Praying hands, simplified — the prayer wall. */
export function PrayIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4.5c-1.6 2.4-3.5 4.6-3.5 8a3.5 3.5 0 0 0 7 0c0-3.4-1.9-5.6-3.5-8Z" {...s} />
      <Path d="M12 16v4.5" {...s} />
    </Svg>
  );
}

/** A ribbon bookmark — fills gold when set. */
export function BookmarkIcon(props: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(props.filled ? colors.gold : color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.6L6 20V5.5a1 1 0 0 1 1-1Z"
        {...s}
        fill={props.filled ? colors.goldBright : 'none'}
        fillOpacity={props.filled ? 0.9 : 0}
      />
    </Svg>
  );
}

/** Search magnifying glass. */
export function SearchIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="10.5" cy="10.5" r="6" {...s} />
      <Line x1="15" y1="15" x2="20" y2="20" {...s} />
    </Svg>
  );
}

/** A soft heart — favorites. */
export function HeartIcon(props: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(props.filled ? colors.gold : color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 19.5c-4.4-3.1-7.5-5.9-7.5-9.3A4.2 4.2 0 0 1 8.7 6c1.3 0 2.6.7 3.3 1.9A3.9 3.9 0 0 1 15.3 6a4.2 4.2 0 0 1 4.2 4.2c0 3.4-3.1 6.2-7.5 9.3Z"
        {...s}
        fill={props.filled ? colors.goldBright : 'none'}
        fillOpacity={props.filled ? 0.9 : 0}
      />
    </Svg>
  );
}

/** Simple person silhouette — account. */
export function UserIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="4" {...s} />
      <Path d="M4 21a8 8 0 0 1 16 0" {...s} />
    </Svg>
  );
}

/** Google "G" logo — sign-in button. */
export function GoogleIcon(props: IconProps) {
  const { size } = useIcon(props);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </Svg>
  );
}

/** Simple envelope — email input. */
export function MailIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3.5" y="5.5" width="17" height="13" rx="2" {...s} />
      <Path d="M4 6.5 12 13l8-6.5" {...s} />
    </Svg>
  );
}

/** Quiet gear — settings. */
export function GearIcon(props: IconProps) {
  const { size, color, strokeWidth } = useIcon(props);
  const s = stroke(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3" {...s} />
      <Path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.3 6.3l1.6 1.6M16.1 16.1l1.6 1.6M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6" {...s} />
    </Svg>
  );
}
