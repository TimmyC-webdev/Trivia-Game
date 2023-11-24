"use strict";

const questionsNumberEl = document.querySelector("#questions-amount");
const categoryEl = document.querySelector("#category");
const levelEl = document.querySelector("#level");
const timeEl = document.querySelector("#time");
const startEl = document.querySelector(".start");
const startDisplay = document.querySelector(".start-display");
const settingsEl = document.querySelector(".settings");
const gameDisplayEl = document.querySelector(".game-display");
const progressBarEl = document.querySelector(".bar");
const answersContainer = document.querySelector(".answers-container");
const errorMessage = document.querySelector(".error");

let questions = [];
let timer,
  time,
  currQuestion,
  score = 0;

const progress = (val) => {
  const percent = (val / time) * 100;
  progressBarEl.style.width = `${percent}%`;
};

async function triviaLaunch() {
  try {
    const number = questionsNumberEl.value;
    const category = categoryEl.value;
    const level = levelEl.value;
    loading();

    const url = `https://opentdb.com/api.php?amount=${number}&category=${category}&difficulty=${level}&type=multiple`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching questions. Status: ${response.status} `);
    }

    const results = await response.json();

    if (results.response_code !== 0) {
      throw new Error(
        `Error getting questions from the API. Response code: ${results.response_code}`
      );
    }

    questions = results.results;

    setTimeout(() => {
      startDisplay.classList.add("hide");
      gameDisplayEl.classList.remove("hide");
      currQuestion = 1;

      displayQuestion(questions[0]);
    }, 1000);
  } catch (error) {
    console.error("An error occurred:", error.message);

    errorMessage.classList.remove("hide");
    errorMessage.innerHTML = `Something went wrong!!! ${error.message}`;
  }
}

const displayQuestion = (question) => {
  const questionText = document.querySelector(".question-text");
  questionText.innerHTML = `
    ${currQuestion} / ${questions.length} ${question.question}`;

  const answers = [
    ...question.incorrect_answers,
    question.correct_answer.toString(),
  ];
  answersContainer.innerHTML = "";

  answers.sort(() => Math.random() - 0.5);
  answers.forEach((answer) => {
    answersContainer.innerHTML += `
      <div class="answer">
      <span class="text">${answer}</span>
      <span class="checkbox">
        <span class="icon">✓</span>
      </span>
      </div>
      `;
  });

  const answerWrap = document.querySelectorAll(".answer");
  answerWrap.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answerWrap.forEach((answer) => {
          answer.classList.remove("selected");
        });

        answer.classList.add("selected");
        btnSubmit.disabled = false;
      }
    });
  });

  time = timeEl.value;
  launchTimer(time);
};

const launchTimer = (time) => {
  timer = setInterval(() => {
    if (time >= 0) {
      progress(time);
      time--;
    } else {
      checkAnswer();
    }
  }, 1000);
};

const loading = () => {
  startEl.innerHTML = ".";
  const loadingInterval = setInterval(() => {
    if (startEl.length === "") {
      startEl.innerHTML = ".";
    } else {
      startEl.innerHTML += ".";
    }
    if (startEl.innerHTML === "....") {
      startEl.innerHTML = "";
    }
  }, 500);
};

const btnSubmit = document.querySelector(".submit");
const btnNext = document.querySelector(".next");

btnSubmit.addEventListener("click", () => {
  checkAnswer();
});

btnNext.addEventListener("click", () => {
  nextQuestion();
  btnSubmit.style.display = "flex";
  btnNext.style.display = "none";
});

const checkAnswer = () => {
  clearInterval(timer);
  const clickedAnswer = document.querySelector(".answer.selected");
  if (clickedAnswer) {
    const answer = clickedAnswer.querySelector(".text").innerHTML;
    if (answer === questions[currQuestion - 1].correct_answer) {
      score++;
      clickedAnswer.classList.add("correct");
    } else {
      clickedAnswer.classList.add("incorrect");
      const correctAnswer = document
        .querySelectorAll(".answer")
        .forEach((answer) => {
          if (
            answer.querySelector(".text").innerHTML ===
            questions[currQuestion - 1].correct_answer
          ) {
            answer.classList.add("correct");
          }
        });
    }
  } else {
    const correctAnswer = document
      .querySelectorAll(".answer")
      .forEach((answer) => {
        if (
          answer.querySelector(".text").innerHTML ===
          questions[currQuestion - 1].correct_answer
        ) {
          answer.classList.add("correct");
        }
      });
  }
  const answerWrap = document.querySelectorAll(".answer");
  answerWrap.forEach((answer) => {
    answer.classList.add("checked");
  });
  btnSubmit.style.display = "none";
  btnNext.style.display = "flex";
};

const nextQuestion = () => {
  if (currQuestion < questions.length) {
    currQuestion++;
    displayQuestion(questions[currQuestion - 1]);
  } else {
    displayScore();
  }
};

const resultsDisplayEl = document.querySelector(".results-display");
const finalScore = document.querySelector(".final-score");

const displayScore = () => {
  resultsDisplayEl.classList.remove("hide");
  gameDisplayEl.classList.add("hide");
  finalScore.innerHTML = `You scored ${score} / ${questions.length}`;
};

finalScore.innerHTML = `You scored ${score} / ${questions.length}`;

const btnRestart = document.querySelector(".restart");

btnRestart.addEventListener("click", () => {
  window.location.reload();
});

startEl.addEventListener("click", triviaLaunch);
