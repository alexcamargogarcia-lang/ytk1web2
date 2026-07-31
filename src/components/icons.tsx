import type { SocialIcon } from "@/lib/types";

interface IconProps {
  className?: string;
}

function Base({
  className = "h-5 w-5",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9 19.5c-4.3 1.2-4.5-2.2-6.5-2.6" />
      <path d="M15.5 21.5v-3.2c0-.9.1-1.3-.5-1.9 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.8 11.8 0 0 0-6.2 0C7.1 3.7 6.1 4 6.1 4a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.7 10.4c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 1.9v3.2" />
    </Base>
  );
}

export function DiscordIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M8.5 17.5c-2.2-.6-3.8-2-4.9-4.2-.7-2.6-.5-5.1.2-7.4 1.6-1.2 3.3-2 5.1-2.4l.6 1.3a15 15 0 0 1 5 0l.6-1.3c1.8.4 3.5 1.2 5.1 2.4.7 2.3.9 4.8.2 7.4-1.1 2.2-2.7 3.6-4.9 4.2l-1-1.6a10 10 0 0 1-4.8 0l-1.2 1.6z" />
      <circle cx="9" cy="12" r="0.6" fill="currentColor" />
      <circle cx="15" cy="12" r="0.6" fill="currentColor" />
    </Base>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 4l16 16M20 4L4 20" />
      <path d="M4 4h3.5L20 20h-3.5L4 4z" strokeWidth="1.2" />
    </Base>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.7" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function YouTubeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.2l5 2.8-5 2.8V9.2z" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 11v5M8 8v.2M12 16v-3a2 2 0 0 1 4 0v3" />
    </Base>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </Base>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5S14.6 18 12 20.5C9.4 18 8.2 15.3 8.2 12S9.4 6 12 3.5z" />
    </Base>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M16.6 3c.35 1.98 1.68 3.42 3.9 3.58v2.87c-1.45.03-2.75-.4-3.9-1.2v5.85a5.75 5.75 0 1 1-5.75-5.75c.26 0 .52.02.77.05v3a2.76 2.76 0 1 0 1.98 2.65V3h3z"
      />
    </svg>
  );
}

export function TwitchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4 3 2.5 7v13h4.5V22h2.1l2-2h3.2l4.7 4.7H22V7.7L17.5 3H4Zm14.5 4v8.5L15.3 18.5h-3.3l-2 2v-2H7.3V4.8h11.2v2.2Zm-3.3-.6h-1.7v5.1h1.7V6.4Zm-4.5 0H9v5.1h1.7V6.4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2" />
    </Base>
  );
}

export function ArrowUpRight({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6.5 17.5L17.5 6.5M8.5 6.5h9v9" />
    </Base>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M21 3.5L10.2 13.8M21 3.5l-6.8 17-3.9-6.7L3.5 10l17.5-6.5z" />
    </Base>
  );
}

export function ZapIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M13 2.5L4.5 13.5H11l-1 8L18.5 10H12l1-7.5z" />
    </Base>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Base>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
      <path d="M12 10v4.5M12 17.4v.2" />
    </Base>
  );
}

export function RadioIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8" />
    </Base>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 21s-6.5-5.4-6.5-10.2a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </Base>
  );
}

export const SOCIAL_ICON_MAP: Record<SocialIcon, (p: IconProps) => React.JSX.Element> = {
  github: GitHubIcon,
  discord: DiscordIcon,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  linkedin: LinkedInIcon,
  tiktok: TikTokIcon,
  twitch: TwitchIcon,
  mail: MailIcon,
  globe: GlobeIcon,
};
