let openQuestions = [];
let openIndex = 0;
let openAnswers = [];

// Le tue risposte personali (per confronto)
let myOpenAnswers = [
    "Non lo so...",
    "Ogni volta che mi scrivi, che ti vedo sorridere 🥺❤️",
    "Grattini, baci",
    "Già te lo avevo detto, ma il carattere",
    "Volerti vedere e avere 🙈",
    "Tra di noi, vederci e poter eliminare le mie preoccupazioni/paranoie",
    "Mi astengo della facoltà di non rispondere",
    "Non lo so... L'attenzione e l'interesse ?!",
    "Poter essere tranquillo di essere me stesso?!"
];

async function loadOpenQuestions() {
    const res = await fetch('../data/question.json');
    const data = await res.json();

    openQuestions = data.domandeAperte;   // <- CORRETTO
    showOpenQuestion();
}

function showOpenQuestion() {
    document.querySelector(".question-text").textContent = openQuestions[openIndex];
    document.querySelector(".open-input").value = "";
}

document.querySelector("#open-next-btn").addEventListener("click", () => {
    const answer = document.querySelector(".open-input").value.trim();

    if (!answer) return alert("Scrivi qualcosa ❤️");

    openAnswers.push(answer);
    openIndex++;

    if (openIndex < openQuestions.length) {
        showOpenQuestion();
    } else {
        showFinalOpenResults();
    }
});

function showFinalOpenResults() {
    document.body.innerHTML = `
        <h1>Fatto! 💜</h1>
        <h3>Le tue risposte:</h3>
        <pre>${JSON.stringify(openAnswers, null, 2)}</pre>

        <h3>Le mie risposte:</h3>
        <pre>${JSON.stringify(myOpenAnswers, null, 2)}</pre>

      <div class="result-actions">
        <button id="play-again">Gioca ancora</button>
        <button id="go-home">Home</button>
      </div>
    `;
      document.body.innerHTML = resultHtml;

  // reattach events
  document.getElementById('play-again').addEventListener('click', () => {
    // reset e ricarica la pagina corrente (o ricomincia)
    index = 0;
    answers = [];
    // ricarica the initial html (semplice reload della pagina)
    window.location.reload();
  });

  document.getElementById('go-home').addEventListener('click', () => {
    // se hai una index.html nella root
    window.location.href = '../index.html';
  });
}

loadOpenQuestions();