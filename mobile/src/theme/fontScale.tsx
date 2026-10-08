import React, { createContext, useContext, useMemo } from 'react';

// Selectable text size steps (multiplier applied to every font size)
export const FONT_SCALE_STEPS = [0.85, 0.92, 1, 1.1, 1.2, 1.3, 1.4];
export const DEFAULT_FONT_SCALE = 1;

interface FontScaleContextValue {
  scale: number;
  canIncrease: boolean;
  canDecrease: boolean;
}

const FontScaleContext = createContext<FontScaleContextValue>({
  scale: DEFAULT_FONT_SCALE,
  canIncrease: true,
  canDecrease: true,
});

export function normalizeFontScale(value: number): number {
  return FONT_SCALE_STEPS.includes(value) ? value : DEFAULT_FONT_SCALE;
}

export function stepFontScale(current: number, direction: 1 | -1): number {
  const index = FONT_SCALE_STEPS.indexOf(normalizeFontScale(current));
  const next = Math.min(FONT_SCALE_STEPS.length - 1, Math.max(0, index + direction));
  return FONT_SCALE_STEPS[next];
}

export const FontScaleProvider: React.FC<{ scale: number; children: React.ReactNode }> = ({
  scale,
  children,
}) => {
  const value = useMemo(() => {
    const index = FONT_SCALE_STEPS.indexOf(normalizeFontScale(scale));
    return {
      scale,
      canIncrease: index < FONT_SCALE_STEPS.length - 1,
      canDecrease: index > 0,
    };
  }, [scale]);

  return <FontScaleContext.Provider value={value}>{children}</FontScaleContext.Provider>;
};

export function useFontScale(): FontScaleContextValue {
  return useContext(FontScaleContext);
}
