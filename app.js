"use strict";

const questionsNumberInput = document.querySelector("#questions-amount");
const categoryInput = document.querySelector("#category");
const levelInput = document.querySelector("#level");
const timeInput = document.querySelector("#time");
const startButton = document.querySelector(".start");
const startDisplay = document.querySelector(".start-display");
const gameDisplay = document.querySelector(".game-display");
const progressBar = document.querySelector(".bar");
const answersContainer = document.querySelector(".answers-container");
const errorMessage = document.querySelector(".error");
const DISPLAY_DELAY = 1000;

let questions = [];
let timer,
  time,
  currQuestion,
  score = 0;

const progress = (val) => {
  const percent = (val / time) * 100;
  progressBar.style.width = `${percent}%`;
};

async function triviaLaunch() {
  try {
    const number = questionsNumberInput.value;
    const category = categoryInput.value;
    const level = levelInput.value;
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
      gameDisplay.classList.remove("hide");
      currQuestion = 1;

      displayQuestion(questions[0]);
    }, DISPLAY_DELAY);
  } catch (error) {
    console.error("An error occurred:", error.message);

    errorMessage.classList.remove("hide");
    errorMessage.innerHTML = `Something went wrong!!! ${error.message}`;
  }
}

const displayQuestion = (question) => {
  updateQuestionText(question);
  displayAnswers(question);
  time = timeInput.value;

  launchTimer(time);
};

const updateQuestionText = (question) => {
  const questionText = document.querySelector(".question-text");
  questionText.innerHTML = `
    ${currQuestion} / ${questions.length} ${question.question}`;
};

const displayAnswers = (question) => {
  const answers = [
    ...question.incorrect_answers,
    question.correct_answer.toString(),
  ];
  answersContainer.innerHTML = "";

  answers.sort(() => Math.random() - 0.5);
  answers.forEach((answer) => {
    answersContainer.innerHTML += createAnswerElement(answer);
  });

  addAnswerEventListeners();
};

const createAnswerElement = (answer) => {
  return `
      <div class="answer">
      <span class="text">${answer}</span>
      <span class="checkbox">
        <span class="icon">✓</span>
      </span>
      </div>
      `;
};

const addAnswerEventListeners = () => {
  const answerWrap = document.querySelectorAll(".answer");
  answerWrap.forEach((answer) => {
    answer.addEventListener("click", () => {
      handleAnswerClick(answerWrap, answer);
    });
  });
};

const handleAnswerClick = (answerWrap, answer) => {
  if (!answer.classList.contains("checked")) {
    answerWrap.forEach((answer) => {
      answer.classList.remove("selected");
    });

    answer.classList.add("selected");
    btnSubmit.disabled = false;
  }
};

const launchTimer = (time) => {
  timer = setInterval(() => {
    if (time >= 0) {
      progress(time);
      time--;
    } else {
      checkAnswer();
    }
  }, DISPLAY_DELAY);
};

const loading = () => {
  startButton.textContent = ".";
  const loadingInterval = setInterval(() => {
    if (startButton.textContent.length === 0) {
      startButton.textContent = ".";
    } else {
      startButton.textContent += ".";
    }
    if (startButton.textContent === "....") {
      startButton.textContent = "";
    }
  }, DISPLAY_DELAY);
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
  gameDisplay.classList.add("hide");
  finalScore.innerHTML = `You scored ${score} / ${questions.length}`;
};

const btnRestart = document.querySelector(".restart");

btnRestart.addEventListener("click", () => {
  score = 0;
  window.location.reload();
});

startButton.addEventListener("click", triviaLaunch);
