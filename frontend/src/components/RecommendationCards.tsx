import type { RecommendationCard } from "../types";

interface RecommendationCardsProps {
  cards: RecommendationCard[];
}

function RecommendationCards({ cards }: RecommendationCardsProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Recommendation cards</h2>
        <span>Deterministic rules</span>
      </div>
      <div className="recommendation-grid">
        {cards.map((card) => (
          <article className="recommendation" key={card.title}>
            <span className={`priority ${card.priority.toLowerCase()}`}>{card.priority}</span>
            <h3>{card.title}</h3>
            <p>{card.rationale}</p>
            <strong>{card.metric}</strong>
            <small>{card.suggested_action}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RecommendationCards;
