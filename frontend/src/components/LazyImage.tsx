interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  width,
  height
}: LazyImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "auto" : "async"}
      className={className}
      width={width}
      height={height}
    />
  );
}
