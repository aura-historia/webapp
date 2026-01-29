import { useEffect, useState, useRef } from "react";

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
}: UseAnimatedPlaceholderOptions): string {
    const [currentText, setCurrentText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!enabled || examples.length === 0) {
            setCurrentText("");
            return;
        }

        const currentExample = examples[currentIndex];

        const animate = () => {
            if (!isDeleting) {
                // Typing phase
                if (currentText.length < currentExample.length) {
                    setCurrentText(currentExample.slice(0, currentText.length + 1));
                    timeoutRef.current = setTimeout(animate, typingSpeed);
                } else {
                    // Finished typing, wait before deleting
                    timeoutRef.current = setTimeout(() => {
                        setIsDeleting(true);
                    }, delayBetweenExamples);
                }
            } else {
                // Deleting phase
                if (currentText.length > 0) {
                    setCurrentText(currentText.slice(0, -1));
                    timeoutRef.current = setTimeout(animate, deletingSpeed);
                } else {
                    // Finished deleting, move to next example
                    setIsDeleting(false);
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % examples.length);
                }
            }
        };

        timeoutRef.current = setTimeout(animate, isDeleting ? deletingSpeed : typingSpeed);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [
        currentText,
        currentIndex,
        isDeleting,
        examples,
        typingSpeed,
        deletingSpeed,
        delayBetweenExamples,
        enabled,
    ]);

    // Cursor flashing effect
    useEffect(() => {
        if (!enabled || examples.length === 0) {
            return;
        }

        const cursorInterval = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 500);

        return () => {
            clearInterval(cursorInterval);
        };
    }, [enabled, examples.length]);

    if (!enabled || examples.length === 0) {
        return "";
    }

    return cursorVisible ? `${currentText}|` : currentText;
}
