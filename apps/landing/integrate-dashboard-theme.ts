/**
 * Thor.dev Theme Integration
 * Extracts colors, fonts, and styling from landing page for dashboard consistency
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  cosmic: {
    light: string;
    dark: string;
    accent: string;
  };
  lightning: {
    primary: string;
    secondary: string;
    glow: string;
  };
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
  special: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      smooth: string;
      bounce: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/**
 * Extract theme configuration from landing page CSS
 * This function reads the landing page styles and creates a consistent theme
 * for the dashboard application
 */
export function extractLandingTheme(): ThemeConfig {
  return {
    colors: {
      // Core colors from landing page
      primary: "#5724ff", // violet-300
      secondary: "#4fb7dd", // blue-300
      accent: "#edff66", // yellow-300
      background: "#dfdff0", // blue-50
      foreground: "#101010", // blue-200
      muted: "#f0f2fa", // blue-100
      border: "rgba(255, 255, 255, 0.2)", // border-hsla
      
      // Cosmic theme for dashboard
      cosmic: {
        light: "#1e293b", // cosmic-800
        dark: "#0f172a", // cosmic-900
        accent: "#5724ff", // violet-300
      },
      
      // Lightning accents
      lightning: {
        primary: "#f59e0b", // lightning-400
        secondary: "#fcd34d", // lightning-300
        glow: "#5724ff", // violet-300 for glow effects
      },
    },
    
    fonts: {
      heading: "zentry, sans-serif",
      body: "general, sans-serif",
      mono: "ui-monospace, monospace",
      special: "circular-web, sans-serif",
    },
    
    animations: {
      duration: {
        fast: "0.15s",
        normal: "0.3s",
        slow: "0.5s",
      },
      easing: {
        default: "cubic-bezier(0.4, 0, 0.2, 1)",
        smooth: "cubic-bezier(0.65, 0.05, 0.36, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
    
    spacing: {
      xs: "0.5rem",
      sm: "1rem", 
      md: "1.5rem",
      lg: "2rem",
      xl: "3rem",
    },
  };
}

/**
 * Generate Tailwind CSS variables from theme config
 * This creates CSS custom properties that can be used throughout the dashboard
 */
export function generateTailwindVars(theme: ThemeConfig): string {
  return `
    :root {
      /* Colors */
      --thor-primary: ${theme.colors.primary};
      --thor-secondary: ${theme.colors.secondary};
      --thor-accent: ${theme.colors.accent};
      --thor-background: ${theme.colors.background};
      --thor-foreground: ${theme.colors.foreground};
      --thor-muted: ${theme.colors.muted};
      --thor-border: ${theme.colors.border};
      
      /* Cosmic theme */
      --thor-cosmic-light: ${theme.colors.cosmic.light};
      --thor-cosmic-dark: ${theme.colors.cosmic.dark};
      --thor-cosmic-accent: ${theme.colors.cosmic.accent};
      
      /* Lightning accents */
      --thor-lightning-primary: ${theme.colors.lightning.primary};
      --thor-lightning-secondary: ${theme.colors.lightning.secondary};
      --thor-lightning-glow: ${theme.colors.lightning.glow};
      
      /* Animations */
      --thor-duration-fast: ${theme.animations.duration.fast};
      --thor-duration-normal: ${theme.animations.duration.normal};
      --thor-duration-slow: ${theme.animations.duration.slow};
      
      /* Spacing */
      --thor-spacing-xs: ${theme.spacing.xs};
      --thor-spacing-sm: ${theme.spacing.sm};
      --thor-spacing-md: ${theme.spacing.md};
      --thor-spacing-lg: ${theme.spacing.lg};
      --thor-spacing-xl: ${theme.spacing.xl};
    }
    
    /* Dark theme overrides */
    .dark {
      --thor-background: ${theme.colors.cosmic.dark};
      --thor-foreground: ${theme.colors.background};
      --thor-muted: ${theme.colors.cosmic.light};
    }
  `;
}

/**
 * Apply theme to dashboard components
 * This utility function helps maintain visual consistency
 */
export function applyThemeClasses(element: 'button' | 'card' | 'panel' | 'modal'): string {
  const baseClasses = 'transition-all duration-300 ease-smooth';
  
  switch (element) {
    case 'button':
      return `${baseClasses} bg-thor-primary hover:bg-thor-secondary text-white font-medium rounded-lg px-4 py-2 shadow-lg hover:shadow-xl hover:animate-glow`;
      
    case 'card':
      return `${baseClasses} bg-white/10 backdrop-blur-sm border border-thor-border rounded-xl p-6 shadow-lg hover:shadow-xl`;
      
    case 'panel':
      return `${baseClasses} bg-thor-cosmic-dark border border-thor-border rounded-lg overflow-hidden shadow-2xl`;
      
    case 'modal':
      return `${baseClasses} bg-thor-cosmic-dark border border-thor-border rounded-xl shadow-2xl backdrop-blur-md`;
      
    default:
      return baseClasses;
  }
}

/**
 * Custom hook for theme-aware animations
 */
export function useThemeAnimations() {
  const theme = extractLandingTheme();
  
  return {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: parseFloat(theme.animations.duration.normal) },
    },
    slideUp: {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { 
        duration: parseFloat(theme.animations.duration.normal),
        ease: theme.animations.easing.smooth,
      },
    },
    float: {
      animate: {
        y: [0, -10, 0],
      },
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    glow: {
      animate: {
        boxShadow: [
          `0 0 5px ${theme.colors.lightning.glow}`,
          `0 0 20px ${theme.colors.lightning.glow}, 0 0 30px ${theme.colors.lightning.glow}`,
          `0 0 5px ${theme.colors.lightning.glow}`,
        ],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };
}