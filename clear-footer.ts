import { homedir } from "node:os";
import { sep } from "node:path";
import { stripVTControlCharacters } from "node:util";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

const PROVIDERS: Record<string, string> = {
	openai: "OpenAI",
	"openai-codex": "OpenAI Codex",
	anthropic: "Anthropic",
	google: "Google",
	"google-gemini-cli": "Google Gemini CLI",
	"google-vertex": "Google Vertex",
	openrouter: "OpenRouter",
	"amazon-bedrock": "Amazon Bedrock",
	ollama: "Ollama",
};

function clean(value: string): string {
	return stripVTControlCharacters(value)
		.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, "")
		.trim();
}

function displayDirectory(cwd: string): string {
	const home = homedir();
	return clean(cwd === home ? "~" : cwd.startsWith(home + sep) ? "~" + cwd.slice(home.length) : cwd);
}

export default function clearFooter(pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsubscribe = footerData.onBranchChange(() => tui.requestRender());
			return {
				dispose: unsubscribe,
				invalidate() {},
				render(width: number): string[] {
					if (width <= 0) return [""];
					const left = [
						displayDirectory(ctx.cwd),
						clean(ctx.sessionManager.getSessionName() ?? ""),
						clean(footerData.getGitBranch() ?? ""),
					].filter(Boolean).join(" · ");

					const percent = ctx.getContextUsage()?.percent;
					const usage = percent != null && Number.isFinite(percent) ? `${Math.round(percent)}%` : "—%";
					const provider = ctx.model?.provider;
					const rightParts = [
						theme.fg(percent != null && percent >= 80 ? "warning" : "muted", usage),
						provider ? theme.fg("muted", clean(PROVIDERS[provider] ?? provider)) : "",
						theme.fg("accent", clean(ctx.model?.name || ctx.model?.id || "No model")),
						theme.fg("muted", clean(pi.getThinkingLevel())),
					].filter(Boolean);
					const right = truncateToWidth(rightParts.join(theme.fg("dim", " · ")), width);
					const rightWidth = visibleWidth(right);
					const leftBudget = Math.max(0, width - rightWidth - 2);
					const fittedLeft = leftBudget > 0 ? truncateToWidth(left, leftBudget) : "";
					const gap = " ".repeat(Math.max(0, width - visibleWidth(fittedLeft) - rightWidth));
					return [theme.fg("muted", fittedLeft) + gap + right];
				},
			};
		});
	});
}
