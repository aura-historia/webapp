import { AiAgentsAccountSection } from "@/features/ai-agents/components/AiAgentsAccountSection.tsx";
import { AiAgentsCapabilitiesSection } from "@/features/ai-agents/components/AiAgentsCapabilitiesSection.tsx";
import { AiAgentsClosingSection } from "@/features/ai-agents/components/AiAgentsClosingSection.tsx";
import { AiAgentsConnectSection } from "@/features/ai-agents/components/AiAgentsConnectSection.tsx";
import { AiAgentsHeroSection } from "@/features/ai-agents/components/AiAgentsHeroSection.tsx";

/** The public page on using Aura Historia with AI assistants (board "AI agents · Page"). */
export function AiAgentsPage() {
    return (
        <div className="bg-surface">
            <AiAgentsHeroSection />
            <AiAgentsCapabilitiesSection />
            <AiAgentsConnectSection />
            <AiAgentsAccountSection />
            <AiAgentsClosingSection />
        </div>
    );
}
