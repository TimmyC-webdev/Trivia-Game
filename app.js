"use strict";

//DOM elements
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

//Game state variables
let questions = [];
let timer,
  time,
  currQuestion,
  score = 0;

//Function to display progress in the progress bar
const progress = (val) => {
  const percent = (val / time) * 100;
  progressBar.style.width = `${percent}%`;
};

//Function to launch the trivia game
async function triviaLaunch() {
  try {
    const number = questionsNumberInput.value;
    const category = categoryInput.value;
    const level = levelInput.value;
    loading();

    //Fetch questions from the Open Trivia Database
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

    //Store fetched questions
    questions = results.results;

    //Transition to the game display after a delay
    setTimeout(() => {
      startDisplay.classList.add("hide");
      gameDisplay.classList.remove("hide");
      currQuestion = 1;

      displayQuestion(questions[0]);
    }, DISPLAY_DELAY);
  } catch (error) {
    console.error("An error occurred:", error.message);

    //Display error message if an error occurs during launch
    errorMessage.classList.remove("hide");
    errorMessage.innerHTML = `Something went wrong!!! ${error.message}`;
  }
}

//Function to display a question
const displayQuestion = (question) => {
  updateQuestionText(question);
  displayAnswers(question);
  time = timeInput.value;

  launchTimer(time);
};

//Function to update the text of the current question
const updateQuestionText = (question) => {
  const questionText = document.querySelector(".question-text");
  questionText.innerHTML = `
    ${currQuestion} / ${questions.length} ${question.question}`;
};

//Function to display answer choices
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

//Function to create an HTML element for an answer choice
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

//Function to add event listeners to answer choices
const addAnswerEventListeners = () => {
  const answerWrap = document.querySelectorAll(".answer");
  answerWrap.forEach((answer) => {
    answer.addEventListener("click", () => {
      handleAnswerClick(answerWrap, answer);
    });
  });
};

//Function to handle a click on an answer choice
const handleAnswerClick = (answerWrap, answer) => {
  if (!answer.classList.contains("checked")) {
    answerWrap.forEach((answer) => {
      answer.classList.remove("selected");
    });

    answer.classList.add("selected");
    btnSubmit.disabled = false;
  }
};

//Function to launch the timer for each question
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

//Function to display loading animation
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

//Button elements
const btnSubmit = document.querySelector(".submit");
const btnNext = document.querySelector(".next");

//Event listeners for submit and next buttons
btnSubmit.addEventListener("click", () => {
  checkAnswer();
});

btnNext.addEventListener("click", () => {
  nextQuestion();
  btnSubmit.style.display = "flex";
  btnNext.style.display = "none";
});

//Function to check the selected answer and update the score
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

//Function to move to the next question or display the final score
const nextQuestion = () => {
  if (currQuestion < questions.length) {
    currQuestion++;
    displayQuestion(questions[currQuestion - 1]);
  } else {
    displayScore();
  }
};

//Results display elements
const resultsDisplayEl = document.querySelector(".results-display");
const finalScore = document.querySelector(".final-score");

//Function to display the final score
const displayScore = () => {
  resultsDisplayEl.classList.remove("hide");
  gameDisplay.classList.add("hide");
  finalScore.innerHTML = `You scored ${score} / ${questions.length}`;
};

//Button element to restart the game
const btnRestart = document.querySelector(".restart");

//Event listener for the restart button
btnRestart.addEventListener("click", () => {
  score = 0;
  window.location.reload();
});

//Event listener for the start button to launch the game
startButton.addEventListener("click", triviaLaunch);
