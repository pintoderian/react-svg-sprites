import React from 'react';

interface SpriteIconProps {
  className?: string;
  src: string;
  width: number | string;
  height: number | string;
  spritePath?: string;
}

const SpriteIcon: React.FC<SpriteIconProps> = ({
  className,
  src,
  width,
  height,
  spritePath,
}: SpriteIconProps) => {
  if (typeof src !== 'string' || src.trim() === '') {
    console.error(
      'Invalid src prop passed to Icon component. It must be a non-empty string.'
    );
    return null;
  }

  const pathParts: string[] = src.split('/').filter((part: string) => part);
  const fileName: string = pathParts.pop() || '';
  const dirPath: string = pathParts.join('/');

  const spriteId: string = fileName.replace('.svg', '');
  const basePath: string = spritePath || '/sprites';

  const fullSpritePath: string =
    dirPath.length > 0
      ? `${basePath}/${dirPath}/${dirPath.split('/').pop()}-sprite.svg`
      : `${basePath}/${fileName}-sprite.svg`;

  return (
    <svg className={className} width={width} height={height}>
      <use href={`${fullSpritePath}#${spriteId}`} />
    </svg>
  );
};

export default SpriteIcon;
