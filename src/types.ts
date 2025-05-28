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
  /**
   * Folders with raw .svg icons.
   */
  iconDirs?: string[];

  /**
   * Flat array or grouped object of icon components to include in sprite.
   */
  iconComponents?: SpriteIconSource[] | Record<string, SpriteIconSource[]>;

  /**
   * Output directory for the generated sprite files.
   */
  outputDir: string;

  /**
   * Whether to output all sprites in the root (flatOutput = true)
   * or within subfolders (flatOutput = false).
   */
  flatOutput?: boolean;

  /**
   * Custom file name to use for the sprite. Used if flatOutput is true.
   */
  spriteFileName?: string;

  /**
   * Enable SVGO optimization for SVGs before adding to sprite.
   */
  optimize?: boolean;

  /**
   * Include <title> tags inside each <symbol> for accessibility.
   */
  includeTitle?: boolean;
};
