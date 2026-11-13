import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { EffectCoverflow, Keyboard, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'

/**
 * Coverflow carousel, adapted from Skiper UI's Skiper 49 (`Carousel_003`):
 * motion/react and Hugeicons instead of framer-motion and lucide, the
 * site's colors, slides passed as children, and its own previous/next
 * buttons so several carousels on one page don't share Swiper's global
 * `.swiper-button-*` selectors. Follows the page direction (RTL).
 */
export function CoverflowCarousel({
  slides,
  slideWidth = 240,
  slideHeight = 320,
  loop = true,
  showPagination = true,
  showNavigation = true,
  slideShadows = true,
  slideClassName = 'overflow-hidden rounded-xl',
  previousLabel,
  nextLabel,
  onSwiper,
  onActiveIndexChange,
  className,
}: {
  slides: { key: string; content: ReactNode }[]
  slideWidth?: number
  slideHeight?: number
  loop?: boolean
  showPagination?: boolean
  showNavigation?: boolean
  /** Swiper's dark gradient over side slides. Turn off for slides with their own depth. */
  slideShadows?: boolean
  slideClassName?: string
  previousLabel: string
  nextLabel: string
  onSwiper?: (swiper: SwiperInstance) => void
  /** Index into `slides` of the centered slide (loop clones resolved). */
  onActiveIndexChange?: (index: number) => void
  className?: string
}) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null)
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('relative w-full', className)}
    >
      <Swiper
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        loop={loop}
        keyboard={{ enabled: true }}
        speed={reduceMotion ? 0 : 300}
        coverflowEffect={{ rotate: 40, stretch: 0, depth: 100, modifier: 1, slideShadows }}
        pagination={showPagination ? { clickable: true } : false}
        modules={[EffectCoverflow, Keyboard, Pagination]}
        onSwiper={(instance) => {
          setSwiper(instance)
          onSwiper?.(instance)
        }}
        onRealIndexChange={(instance) => onActiveIndexChange?.(instance.realIndex)}
        className="w-full [--swiper-pagination-bullet-inactive-color:var(--muted-foreground)] [--swiper-pagination-color:var(--primary)]"
        style={{ height: slideHeight + (showPagination ? 50 : 0) }}
      >
        {slides.map((slide) => (
          <SwiperSlide
            key={slide.key}
            className={slideClassName}
            style={{ width: slideWidth, height: slideHeight }}
          >
            {slide.content}
          </SwiperSlide>
        ))}
      </Swiper>

      {showNavigation ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-1"
          style={{ height: slideHeight }}
        >
          {/* In RTL the previous slide sits on the right (start) and the next on the left (end). */}
          <NavButton
            label={previousLabel}
            icon={ArrowRight01Icon}
            onClick={() => swiper?.slidePrev()}
          />
          <NavButton label={nextLabel} icon={ArrowLeft01Icon} onClick={() => swiper?.slideNext()} />
        </div>
      ) : null}
    </motion.div>
  )
}

function NavButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: typeof ArrowLeft01Icon
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <HugeiconsIcon icon={icon} className="size-5" />
    </button>
  )
}

/**
 * Skiper 49 Carousel_003 — React + Swiper
 * Built with Swiper.js - Read docs to learn more https://swiperjs.com/
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.me
 * Twitter: https://x.com/Gur__vi
 */
