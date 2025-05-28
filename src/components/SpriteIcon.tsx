import React from 'react';
import { SpriteIconProps } from '../types';

const SpriteIcon: React.FC<SpriteIconProps> = ({
  className,
  width,
  height,
  file,
  symbol,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      role="img"
      aria-hidden="true"
    >
      <use href={`${file}#${symbol}`} />
    </svg>
  );
};

export default SpriteIcon;
