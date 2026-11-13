import { Archive, ArrowsClockwise, FlagBanner, Shield, Scroll, Compass, BookOpen, ChartLine, Gear, Plus, Check, X, Flame, ArrowLeft, ArrowRight, MagnifyingGlass, UserCircle, SignOut, CalendarBlank, PencilSimple, Trash, Funnel, CaretDown, Clock, Target, Flag, Pause, Play, Question, List, Eye, EyeSlash, type Icon as PhosphorIcon } from '@phosphor-icons/react'

const icons: Record<string, PhosphorIcon> = {
  archive: Archive, repeat: ArrowsClockwise, flag: FlagBanner, shield: Shield, scroll: Scroll, compass: Compass, book: BookOpen, eye: ChartLine,
  gear: Gear, plus: Plus, check: Check, x: X, flame: Flame, 'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight, search: MagnifyingGlass, user: UserCircle, logout: SignOut,
  calendar: CalendarBlank, edit: PencilSimple, trash: Trash, filter: Funnel,
  'chevron-down': CaretDown, clock: Clock, target: Target, milestone: Flag,
  pause: Pause, play: Play, help: Question, menu: List, visible: Eye, hidden: EyeSlash,
}

export function Icon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const Glyph = icons[name] ?? Compass
  return <Glyph size={size} weight="regular" className={className} aria-hidden="true" />
}
