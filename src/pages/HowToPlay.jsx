import { ArrowRight, Link2, MousePointer2, Users } from "lucide-react";
import { Button } from "../components/Button";

export function HowToPlay() {
  const steps = [
    [
      MousePointer2,
      "Pick a game",
      "Choose a classic from our growing catalogue.",
    ],
    [Link2, "Make a room", "Create a private room and get a shareable link."],
    [
      Users,
      "Bring your people",
      "Send the link to friends. No accounts, no waiting around.",
    ],
  ];
  return (
    <section className="page-width page-section how-page">
      <div className="page-intro">
        <p className="eyebrow">Simple by design</p>
        <h1>
          From “remember this?”
          <br />
          <em>to game on.</em>
        </h1>
        <p>
          Traditional games deserve a modern front door. Here is how the whole
          thing works.
        </p>
      </div>
      <div className="steps">
        {steps.map(([Icon, title, copy], index) => (
          <div className="step" key={title}>
            <span className="step-number">0{index + 1}</span>
            <Icon />
            <h2>{title}</h2>
            <p>{copy}</p>
            {index < 2 && <ArrowRight className="step-arrow" />}
          </div>
        ))}
      </div>
      <div className="how-cta">
        <p className="eyebrow">Ready when you are</p>
        <h2>Start with a classic.</h2>
        <Button to="/games/barah-goti">Play Barah Goti</Button>
      </div>
    </section>
  );
}
