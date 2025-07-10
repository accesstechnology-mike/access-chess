import Head from "next/head";
import { useRouter } from "next/router";

export default function HomePage() {
  const router = useRouter();

  const startGame = (selectedDifficulty) => {
    router.push(`/game?difficulty=${selectedDifficulty}`);
  };

  return (
    <>
      <Head>
        <title>access: chess</title>
        <meta name="description" content="Accessible chess game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="start-screen">
        <header>
          <h1>♟️ access: chess</h1>
          <p>Choose your difficulty level</p>
        </header>

        <main className="difficulty-selection">
          <button
            onClick={() => startGame("beginner")}
            className="difficulty-btn beginner"
            aria-label="Start beginner guided game"
          >
            <span className="difficulty-emoji">🎓</span>
            <span className="difficulty-text">Beginner Guided</span>
          </button>
          <button
            onClick={() => startGame("easy")}
            className="difficulty-btn easy"
            aria-label="Start easy game"
          >
            <span className="difficulty-emoji">😊</span>
            <span className="difficulty-text">Easy</span>
          </button>

          <button
            onClick={() => startGame("medium")}
            className="difficulty-btn medium"
            aria-label="Start medium game"
          >
            <span className="difficulty-emoji">🤔</span>
            <span className="difficulty-text">Medium</span>
          </button>

          <button
            onClick={() => startGame("hard")}
            className="difficulty-btn hard"
            aria-label="Start hard game"
          >
            <span className="difficulty-emoji">🔥</span>
            <span className="difficulty-text">Hard</span>
          </button>
        </main>
      </div>
    </>
  );
}
