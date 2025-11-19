// /js/thisorthat.js
let questions = [];
let index = 0;
let answers = [];

// le tue risposte (quelle dette "mie"), possono contenere emoji
const myAnswer = [
  "Pizza 🍕",
  "Montagna ⛰️",
  "Cinema 🎥",
  "Caffè ☕️",
  "Notte 🌙",
  "Cane 🐶",
  "Inverno ❄️",
  "Messaggi 💬",
  "Salato 🧂",
  "Sneakers 👟"
];

document.addEventListener("click", (e) => {
  const input = e.target.closest('input[type="radio"]');
  if (!input) return;

  const label = input.closest("label.choice");
  const box = label.closest(".choice-box");

  // rimuovi selected da tutti
  box.querySelectorAll(".choice").forEach(l => l.classList.remove("selected"));

  // aggiungi selected a quello cliccato
  label.classList.add("selected");
});

// path al file JSON — assicurati che esista /data/questions.json
async function loadQuestions() {
  try {
    const res = await fetch('../data/question.json');
    if (!res.ok) throw new Error('Impossibile caricare questions.json: ' + res.status);
    const data = await res.json();
    questions = data.thisorthat || data.thisOrThat || [];
    if (!questions.length) throw new Error('Nessuna domanda nel file JSON.');
    showQuestion();
  } catch (err) {
    console.error(err);
    document.querySelector('.question-container').innerHTML =
      `<div class="error">Errore: ${err.message}</div>`;
  }
}

// mostra la domanda corrente (una alla volta)
function showQuestion() {
  const q = questions[index];
  if (!q) return;

  document.querySelector('.question-container').innerHTML = `
    <div class="q-card">
      <h2 class="q-num">Domanda ${index + 1} di ${questions.length}</h2>
      <p class="q-text">Sei più...</p>

      <div class="choice-box">
        <label class="choice">
          <input type="radio" name="choice" value="${escapeHtml(q.left)}">
          <span>${escapeHtml(q.left)}</span>
        </label>

        <label class="choice">
          <input type="radio" name="choice" value="${escapeHtml(q.right)}">
          <span>${escapeHtml(q.right)}</span>
        </label>
      </div>
    </div>
  `;

  // scroll su elemento o focus sul primo radio
  const firstRadio = document.querySelector('input[name="choice"]');
  if (firstRadio) firstRadio.focus();
}

// funzione semplice per evitare injection se il JSON contiene caratteri strani
function escapeHtml(str){
  return String(str).replace(/[&<>"'`=\/]/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#47;','`':'&#96;','=':'&#61;'
  }[s]));
}

// normalizza la stringa per confronto: rimuove simboli/emoji/punteggiatura, lowercase e trim
function normalizeForCompare(s){
  if (!s) return '';
  // togli i caratteri non-lettera/non-numero/space (rimuove emoji e punteggiatura)
  return s
    .toString()
    .normalize('NFD')                  // decomposizione unicode
    .replace(/[\u0300-\u036f]/g, '')   // rimuove diacritici
    .replace(/[^\p{L}\p{N}\s]/gu, '')  // elimina tutto tranne lettere/numeri/spazi (usa flag u)
    .toLowerCase()
    .trim();
}

// evento Avanti
document.querySelector('#next-btn').addEventListener('click', () => {
  const selected = document.querySelector('input[name="choice"]:checked');
  if (!selected) {
    // UX più gentile: animazione o alert facile
    return alert("Scegli una risposta prima di procedere!");
  }

  answers.push(selected.value);
  index++;

  if (index < questions.length) {
    showQuestion();
  } else {
    // confronto con myAnswer e mostra risultato
    showResults();
  }
});

function showResults() {
  // normalizza entrambi gli array alla lunghezza minore per evitare errori
  const len = Math.min(answers.length, myAnswer.length, questions.length);

  let same = 0;
  const detail = [];

  for (let i = 0; i < len; i++) {
    const her = normalizeForCompare(answers[i]);
    const me = normalizeForCompare(myAnswer[i]);

    const match = (her === me) || her.includes(me) || me.includes(her);
    if (match) same++;

    detail.push({
      question: `${questions[i].left} / ${questions[i].right}`,
      herRaw: answers[i],
      myRaw: myAnswer[i],
      matched: match
    });
  }

  const percent = Math.round((same / len) * 100);

  // mostra risultato bello e leggibile
  const resultHtml = `
    <main class="result-page">
      <h1>Compatibilità: ${percent}%</h1>
      <div class="result-bar">
        <div class="result-progress" style="width:${percent}%;"></div>
      </div>

      <h3>Dettaglio</h3>
      <ul class="result-list">
        ${detail.map(d => `
          <li class="res-item ${d.matched ? 'match' : 'no-match'}">
            <strong>${escapeHtml(d.question)}</strong>
            <div class="res-values">
              <span class="her">Lei: ${escapeHtml(d.herRaw)}</span>
              <span class="me">Tu: ${escapeHtml(d.myRaw)}</span>
              <span class="dot">${d.matched ? '✓' : '✕'}</span>
            </div>
          </li>
        `).join('')}
      </ul>

      <div class="result-actions">
        <button id="play-again">Gioca ancora</button>
        <button id="go-home">Home</button>
      </div>
    </main>
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
    window.location.href = '../inde.html';
  });
}

// avvia
loadQuestions();