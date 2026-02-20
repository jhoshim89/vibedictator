/* eslint-disable i18next/no-literal-string */
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SettingContainer } from "../../ui/SettingContainer";

interface AiSettingsData {
    token: string;
    mode: string;
}

export const AiSettings: React.FC = () => {
    const [settings, setSettings] = useState<AiSettingsData>({ token: "", mode: "code" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        invoke<AiSettingsData>("get_ai_settings")
            .then((data) => setSettings(data))
            .catch((err) => console.error("Failed to load AI settings:", err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await invoke("set_ai_settings", { settings });
        } catch (err) {
            console.error("Failed to save AI settings:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 w-full pl-6 bg-transparent">
                <h1 className="text-3xl font-bold bg-transparent">AI Processing</h1>
                <p className="text-secondary/70 bg-transparent text-sm">
                    Configure GitHub Models API to structure transcribed text. Requires standard GitHub PAT.
                </p>
            </div>

            <SettingContainer>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">GitHub Models token</label>
                        <input
                            type="password"
                            name="token"
                            value={settings.token}
                            onChange={handleChange}
                            className="rounded-md border border-[#3E3E3E] bg-[#2E2E2E] px-3 py-1.5 text-sm outline-none focus:border-[#F27E43] focus:ring-1 focus:ring-[#F27E43]"
                            placeholder="ghp_..."
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Prompt Mode</label>
                        <select
                            name="mode"
                            value={settings.mode}
                            onChange={handleChange}
                            className="rounded-md border border-[#3E3E3E] bg-[#2E2E2E] px-3 py-1.5 text-sm outline-none focus:border-[#F27E43] focus:ring-1 focus:ring-[#F27E43]"
                        >
                            <option value="code">Code (Claude Code prompt)</option>
                            <option value="paper">Paper Writing (Academic)</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-md bg-[#F27E43] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#D96B37] disabled:opacity-50 transition-colors"
                        >
                            {isSaving ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </div>
            </SettingContainer>
        </div>
    );
};
