import {
    Armchair,
    BookOpen,
    Clock,
    Gem,
    Frame,
    Lamp,
    Coins,
    Box,
    Puzzle,
    Shirt,
    Building2,
    Shovel,
    Palette,
    Ticket,
    Camera,
    Music2,
    Sword,
    Wrench,
    Factory,
    Globe,
    Shield,
    PenLine,
    FlaskConical,
    Car,
    Church,
    Shell,
    Folder,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// TODO: Replace with image link map
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    STORAGE_CONTAINERS: Box,
    LIGHTING_OBJECTS: Lamp,
    BOOKS_MANUSCRIPTS_PRINTED_MEDIA: BookOpen,
    FURNITURE: Armchair,
    TOYS_GAMES_RECREATIONAL: Puzzle,
    TEXTILES: Shirt,
    CLOCKS_TIMEKEEPING: Clock,
    JEWELRY_PERSONAL_ADORNMENT: Gem,
    ARCHITECTURAL_ELEMENTS: Building2,
    ARCHAEOLOGICAL_ARTIFACTS: Shovel,
    VISUAL_ART: Palette,
    DECORATIVE_OBJECTS: Frame,
    EPHEMERA_MEMORABILIA: Ticket,
    PHOTOGRAPHY_OPTICAL_MEDIA: Camera,
    MUSICAL_INSTRUMENTS: Music2,
    WEAPONS: Sword,
    TOOLS_IMPLEMENTS: Wrench,
    INDUSTRIAL_TRADE_EQUIPMENT: Factory,
    CULTURAL_ETHNOGRAPHIC: Globe,
    MILITARIA: Shield,
    COINS_CURRENCY_MEDALS: Coins,
    NATURAL_HISTORY_CURIOSITIES: Shell,
    TRANSPORTATION_TRAVEL_OBJECTS: Car,
    RELIGIOUS_RITUAL_CEREMONIAL: Church,
    WRITING_COMMUNICATION_INSTRUMENTS: PenLine,
    SCIENTIFIC_MEDICAL_TECHNICAL: FlaskConical,
} as const;

export const FALLBACK_CATEGORY_ICON: LucideIcon = Folder;

export function getCategoryIcon(categoryKey: string): LucideIcon {
    return CATEGORY_ICON_MAP[categoryKey] ?? FALLBACK_CATEGORY_ICON;
}
