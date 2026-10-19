import { useTypewriter } from "@/hooks/common/useTypewriter.ts";

interface UseAnimatedPlaceholderOptions {
    /**
     * Array of placeholder strings to cycle through
     */
    examples: string[];
    /**
     * Speed of typing in milliseconds per character
     * @default 100
     */
    typingSpeed?: number;
    /**
     * Speed of deleting in milliseconds per character
     * @default 50
     */
    deletingSpeed?: number;
    /**
     * Delay before starting to type the next example (in milliseconds)
     * @default 2000
     */
    delayBetweenExamples?: number;
    /**
     * Whether the animation should start immediately
     * @default true
     */
    enabled?: boolean;
    /**
     * When this value changes, the animation resets to the first example.
     */
    resetKey?: string;
}

/**
 * Custom hook that provides typewriter animation for placeholder text
 * Cycles through an array of examples with typing and deleting effects
 */
export function useAnimatedPlaceholder({
    examples,
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetweenExamples = 2000,
    enabled = true,
    resetKey,
}: UseAnimatedPlaceholderOptions): string {
    return useTypewriter({
        examples,
        typingSpeed,
        deletingSpeed,
        delayBetweenExamples,
        enabled,
        resetKey,
    }).text;
}
