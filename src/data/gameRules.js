import barahGotiMarkdown from "../../docs/barah-goti-rules.md?raw";

const sections = barahGotiMarkdown
  .split(/^## /m)
  .slice(1)
  .map((section) => {
    const [heading, ...body] = section.split("\n");
    return { heading: heading.trim(), body: body.join("\n").trim() };
  });

export const gameRules = {
  "barah-goti": {
    title: "Barah Goti",
    subtitle: "Everything you need to know to play.",
    players: "2",
    tiger: "1",
    goats: "12",
    type: "Strategy",
    sections,
  },
};

export function getGameRules(gameId) {
  return gameRules[gameId];
}
