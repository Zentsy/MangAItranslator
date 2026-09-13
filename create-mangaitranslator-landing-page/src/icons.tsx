type P = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconNib = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M12 2.5c2.6 1.8 5.5 5 5.5 8.4 0 2.6-1.6 4.6-3 6.6l-1.4 3.5h-2.2L9.5 17.5c-1.4-2-3-4-3-6.6 0-3.4 2.9-6.6 5.5-8.4Z" />
    <circle cx="12" cy="10.5" r="1.4" />
    <path d="M12 12v5.5" />
  </svg>
);

export const IconImport = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    <path d="M12 3v10" />
    <path d="m8 9.5 4 4 4-4" />
    <path d="M8 3h8" />
  </svg>
);

export const IconQueue = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="3.5" y="4" width="17" height="4" rx="1" />
    <rect x="3.5" y="10" width="11" height="4" rx="1" />
    <path d="M3.5 18.5h7" />
    <path d="m16.5 14.5 4.5 2.75-4.5 2.75z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconGlossary = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M12 6.5C10 5 7.5 4.5 4.5 4.5v14c3 0 5.5.5 7.5 2 2-1.5 4.5-2 7.5-2v-14c-3 0-5.5.5-7.5 2Z" />
    <path d="M12 6.5v14" />
    <path d="M7.5 9.5h2M7.5 12.5h2M14.5 9.5h2M14.5 12.5h2" />
  </svg>
);

export const IconMemory = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M3.5 5h10.5v7.5H8.5L5.5 15v-2.5H3.5z" />
    <path d="M14 10.5h6.5V17h-2.5V19.5L15 17h-1z" />
    <path d="M6.5 8.5h4.5M16.5 13.5h1.5" />
  </svg>
);

export const IconKeys = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
    <rect x="5.5" y="8.5" width="5" height="5.5" rx="0.8" />
    <rect x="13.5" y="8.5" width="5" height="5.5" rx="0.8" />
    <text
      x="8"
      y="12.9"
      textAnchor="middle"
      fontSize="4.6"
      fontFamily="'DotGothic16', monospace"
      fill="currentColor"
      stroke="none"
    >
      M
    </text>
    <text
      x="16"
      y="12.9"
      textAnchor="middle"
      fontSize="4.6"
      fontFamily="'DotGothic16', monospace"
      fill="currentColor"
      stroke="none"
    >
      S
    </text>
    <path d="M6 16.5h.01M9.5 16.5h.01M13 16.5h.01M16.5 16.5h.01" />
  </svg>
);

export const IconVault = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 8.5V10M12 14v1.5M8.5 12H10M14 12h1.5" />
    <path d="M6.5 20v1.5M17.5 20v1.5" />
  </svg>
);

export const IconEditor = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" />
    <path d="M8.5 10.5h7M8.5 13.5h5" />
  </svg>
);

export const IconExport = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z" />
    <path d="M14 3.5V8h4.5" />
    <path d="M12 17v-5.5" />
    <path d="m9.8 13.7 2.2-2.2 2.2 2.2" />
  </svg>
);

export const IconBolt = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M13 2.5 5.5 13.5H11L9.5 21.5 18.5 9.5H12z" />
  </svg>
);

export const IconSpark4 = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M12 2.5c.7 4.9 4.6 8.8 9.5 9.5-4.9.7-8.8 4.6-9.5 9.5-.7-4.9-4.6-8.8-9.5-9.5 4.9-.7 8.8-4.6 9.5-9.5Z" />
  </svg>
);

export const IconOrbit = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <circle cx="12" cy="12" r="4" />
    <path d="M20.2 7.5c1.6 2.6-.9 7.4-5.6 10.7S5 21.6 3.8 19s1.9-7.4 6.6-10.7 8.2-3.4 9.8-.8Z" />
  </svg>
);

export const IconChip = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="7" y="7" width="10" height="10" rx="1.5" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3" />
  </svg>
);

export const IconServer = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="4" y="5" width="16" height="6" rx="1.5" />
    <rect x="4" y="13" width="16" height="6" rx="1.5" />
    <path d="M7.5 8h.01M7.5 16h.01" />
    <path d="M13 8h4M13 16h4" />
  </svg>
);

export const IconWindows = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M3.5 5.6 10.6 4.6v6.8H3.5zM11.6 4.4 20.5 3.2v8.2h-8.9zM3.5 12.4h7.1v6.8L3.5 18.3zM11.6 12.4h8.9v8.3l-8.9-1.2z"
    />
  </svg>
);

export const IconGithub = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
    />
  </svg>
);

export const IconKofi = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M4 7h13v7.5A4.5 4.5 0 0 1 12.5 19h-4A4.5 4.5 0 0 1 4 14.5Z" />
    <path d="M17 8.5h1.5a2.75 2.75 0 0 1 0 5.5H17" />
    <path
      d="M10.6 10.9c.8-1.3 2.6-.9 2.6.4 0 1.1-1.4 2-2.6 2.8-1.2-.8-2.6-1.7-2.6-2.8 0-1.3 1.8-1.7 2.6-.4Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconArrowL = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const IconWarn = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M12 3.5 22 20H2Z" />
    <path d="M12 9.5V14" />
    <path d="M12 17h.01" />
  </svg>
);

export const IconStarSm = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      fill="currentColor"
      d="M12 3l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z"
    />
  </svg>
);

export const IconSplat = ({ className }: P) => (
  <svg viewBox="0 0 200 200" className={className}>
    <path
      fill="currentColor"
      d="M104 18c10-8 26 2 24 14 14-6 30 6 26 18 16-2 26 14 16 24 14 4 16 22 4 28 10 10 2 26-12 26 6 14-6 26-20 22 0 14-18 20-28 10-8 12-26 8-30-4-14 6-30-4-26-18-14 0-24-16-12-24-12-8-6-26 8-28-8-12 4-26 18-22-4-14 12-22 22-12 4-12 20-14 26-4z"
    />
  </svg>
);
