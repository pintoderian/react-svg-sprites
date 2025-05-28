import type { ComponentType } from 'react';

export interface SpriteIconProps {
  className?: string;
  width: number | string;
  height: number | string;
  file: string;
  symbol: string;
}

export type SpriteIconSource = {
  name: string;
  component: ComponentType<any>;
};

export type SpriteConfig = {
  iconDirs?: string[];
  iconComponents?: SpriteIconSource[];
  outputDir: string;
};
