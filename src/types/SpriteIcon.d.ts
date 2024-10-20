import React from 'react';

export interface SpriteIconProps {
  className?: string;
  src: string;
  width: number;
  height: number;
  spritePath?: string;
}

declare const SpriteIcon: React.FC<SpriteIconProps>;

export default SpriteIcon;
