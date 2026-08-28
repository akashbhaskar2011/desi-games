import { Button } from "../components/Button";

export function NotFound() {
  return (
    <section className="not-found page-width">
      <span className="lost-number">404</span>
      <p className="eyebrow">Wrong turn</p>
      <h1>
        That page wandered
        <br />
        <em>off the board.</em>
      </h1>
      <p>
        There is nothing here, but there are plenty of games waiting for you.
      </p>
      <Button to="/">Back home</Button>
    </section>
  );
}
