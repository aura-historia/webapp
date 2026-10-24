import { useEffect, useRef, useState } from "react";

export interface UseTypewriterOptions {
    /** The strings to cycle through. */
    readonly examples: readonly string[];
    /** Milliseconds per typed character. */
    readonly typingSpeed?: number;
    /** Milliseconds per deleted character. */
    readonly deletingSpeed?: number;
    /** Milliseconds a fully typed example stays before it is deleted. */
    readonly delayBetweenExamples?: number;
    readonly enabled?: boolean;
    /** When this value changes, the animation restarts at the first example. */
    readonly resetKey?: string;
    /**
     * Start with the first example fully typed and delete it first. The first render then
     * matches the server markup, and the text stays in place while the animation is paused.
     */
    readonly startTyped?: boolean;
}

export interface TypewriterState {
    readonly text: string;
    /** Index of the example being typed or deleted. */
    readonly index: number;
}

/** Types and deletes each example in turn, like someone trying out queries. */
export function useTypewriter({
    examples,
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetweenExamples = 2000,
    enabled = true,
    resetKey,
    startTyped = false,
}: UseTypewriterOptions): TypewriterState {
    const [currentText, setCurrentText] = useState(() => (startTyped ? (examples[0] ?? "") : ""));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (resetKey === undefined) return;
        setCurrentText("");
        setCurrentIndex(0);
        setIsDeleting(false);
    }, [resetKey]);

    useEffect(() => {
        if (!enabled || examples.length === 0) {
            if (!startTyped) {
                setCurrentText("");
            }
            return;
        }

        const currentExample = examples[currentIndex % examples.length];

        const animate = () => {
            if (!isDeleting) {
                if (currentText.length < currentExample.length) {
                    setCurrentText(currentExample.slice(0, currentText.length + 1));
                    timeoutRef.current = setTimeout(animate, typingSpeed);
                } else {
                    timeoutRef.current = setTimeout(() => {
                        setIsDeleting(true);
                    }, delayBetweenExamples);
                }
            } else if (currentText.length > 0) {
                setCurrentText(currentText.slice(0, -1));
                timeoutRef.current = setTimeout(animate, deletingSpeed);
            } else {
                setIsDeleting(false);
                setCurrentIndex((prevIndex) => (prevIndex + 1) % examples.length);
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
        startTyped,
    ]);

    return { text: currentText, index: currentIndex % Math.max(examples.length, 1) };
}
