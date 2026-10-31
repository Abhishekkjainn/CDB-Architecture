import { useRef, useState } from 'react'
import { img, imgBlur } from '@/lib/img'
import { useGsap } from '@/lib/useGsap'
import { cn } from '@/lib/cn'

type ImageProps = {
  src: string
  alt: string
  className?: string
  /** CSS aspect-ratio for the frame, e.g. '4/5'. Defaults to 3/2. */
  ratio?: string
  /** Rendered width hint, used to request the right size from the CDN. */
  width?: number
  /** Above the fold images should be eager so they are not lazy-loaded. */
  priority?: boolean
  /** Slow vertical drift as the frame crosses the viewport. */
  parallax?: boolean
  /** Reveal the frame with a clip-path wipe instead of a plain fade. */
  reveal?: boolean
  sizes?: string
}

/**
 * Every photograph on the site goes through here: fixed aspect frame (so there
 * is no layout shift), a blurred 24px placeholder, responsive srcset, and the
 * optional scroll parallax / clip reveal.
 */
export function Image({
  src,
  alt,
  className,
  ratio = '3 / 2',
  width = 1600,
  priority = false,
  parallax = false,
  reveal = true,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px',
}: ImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const blur = imgBlur(src)

  const frameRef = useGsap<HTMLDivElement>(({ self, gsap }) => {
    // CSS hides [data-reveal] before first paint; GSAP owns it from here.
    gsap.set(self, { opacity: 1 })
    // Parallax needs headroom, so the image rests slightly over-scaled.
    const restScale = parallax ? 1.14 : 1

    if (reveal) {
      gsap.fromTo(
        self,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: { trigger: self, start: 'top 88%', once: true },
        },
      )
      gsap.fromTo(
        imgRef.current,
        { scale: restScale * 1.16 },
        {
          scale: restScale,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: self, start: 'top 88%', once: true },
        },
      )
    }

    if (parallax) {
      if (!reveal) gsap.set(imgRef.current, { scale: restScale })
      gsap.fromTo(
        imgRef.current,
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: {
            trigger: self,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }
  }, [src, parallax, reveal])

  return (
    <div
      ref={frameRef}
      data-reveal={reveal ? '' : undefined}
      className={cn('relative overflow-hidden bg-paper-dim', className)}
      style={{ aspectRatio: ratio }}
    >
      {blur && (
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-700',
            loaded ? 'opacity-0' : 'opacity-100',
          )}
          style={{ backgroundImage: `url(${blur})` }}
        />
      )}
      <img
        ref={imgRef}
        src={img(src, { w: width })}
        srcSet={
          src.startsWith('http')
            ? [640, 960, 1280, 1600, 2000]
                .filter((w) => w <= width * 1.5)
                .map((w) => `${img(src, { w })} ${w}w`)
                .join(', ')
            : undefined
        }
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
