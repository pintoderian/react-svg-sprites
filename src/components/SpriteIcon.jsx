import React from "react";
import PropTypes from "prop-types";

const SpriteIcon = ({ className, src, width, height, spritePath }) => {
  if (typeof src !== "string" || src.trim() === "") {
    console.error(
      "Invalid src prop passed to Icon component. It must be a non-empty string."
    );
    return null;
  }

  const pathParts = src.split("/").filter((part) => part);
  const fileName = pathParts.pop();
  const dirPath = pathParts.join("/");

  const spriteId = fileName.replace(".svg", "");
  const basePath = spritePath || "/sprites";

  const fullSpritePath =
    dirPath.length > 0
      ? `${basePath}/${dirPath}/${dirPath.split("/").pop()}-sprite.svg`
      : `${basePath}/${fileName}-sprite.svg`;

  return (
    <svg className={className} width={width} height={height}>
      <use href={`${fullSpritePath}#${spriteId}`}></use>
    </svg>
  );
};

SpriteIcon.propTypes = {
  src: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  spritePath: PropTypes.string,
};

export default SpriteIcon;
