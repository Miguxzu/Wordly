let wordList = null;
let solution = '';
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let timerStarted = false;
let timerInterval = null;
let seconds = 0;
let combo = 0;

const tiles = document.querySelectorAll('.grid-item');
const keys = document.querySelectorAll('.key');
const messageEl = document.getElementById('message');
const messageContainer = document.getElementById('message-container');
const retryBtn = document.querySelector('.retry');
const timeEl = document.getElementById('time');
const comboEl = document.getElementById('combo');
const bubbleContainer = document.querySelector('.bubble-container');
const theme = document.getElementById('theme');


fetch('words.json')
  .then(response => response.json())
  .then(data => {
    wordList = data;
    const randomIndex = Math.floor(Math.random() * wordList.solutions.length);
    solution = wordList.solutions[randomIndex].toUpperCase();
    console.log('Soluzione:', solution); 
  })
  .catch(error => console.error('Errore nel caricamento delle parole:', error));


function getTile(row, col) {
  return tiles[row * 5 + col];
}

function getCurrentWord() {
  let word = '';
  for (let col = 0; col < 5; col++) {
    word += getTile(currentRow, col).textContent;
  }
  return word;
}


function isValidWord(word) {
  return wordList.allowed.includes(word.toUpperCase());
}


function addLetter(letter) {
  if (currentCol < 5 && currentRow < 6) {
    const tile = getTile(currentRow, currentCol);
    tile.textContent = letter.toUpperCase();
    tile.classList.add('filled');
    currentCol++;
  }
}


function deleteLetter() {
  if (currentCol > 0) {
    currentCol--;
    const tile = getTile(currentRow, currentCol);
    tile.textContent = '';
    tile.classList.remove('filled');
  }
}


function updateKeyColor(letter, className) {
  keys.forEach(key => {
    if (key.textContent === letter) {
    
      if (key.classList.contains('right')) return;
      if (key.classList.contains('almost') && className === 'error') return;
      
      key.classList.remove('error', 'almost', 'right');
      if (className) key.classList.add(className);
    }
  });
}


function shakeRow() {
  for (let col = 0; col < 5; col++) 
    getTile(currentRow, col).classList.add('shake');
  
  setTimeout(() => {
    for (let col = 0; col < 5; col++) {
      getTile(currentRow, col).classList.remove('shake');
    }
  }, 500);
}


//SCRITTURA PAROLA
document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  
  const key = e.key.toUpperCase();
  

  if (key.match(/^[A-Z]$/) && key.length === 1) {
    startTimer();
    addLetter(key);
  }

  else if (key === 'BACKSPACE') {
    deleteLetter();
  }

  else if (key === 'ENTER') {
    startTimer();
    submitGuess();
  }
});

//TASTIERA SU SCHERMO
keys.forEach(key => {
  key.addEventListener('click', () => {
    if (gameOver) return;
    
    const letter = key.textContent;
    
    if (letter === 'ENTER') {
      startTimer();
      submitGuess();
    } else if (letter === '⌫') {
      deleteLetter();
    } else if (letter.match(/^[A-Z]$/)) {
      startTimer();
      addLetter(letter);
    }
  });
});




function submitGuess() {
  if (currentCol !== 5) return;
  
  const word = getCurrentWord();
  
  if (!isValidWord(word)) {
    shakeRow();
    return;
  }
  
  const isCorrect = colorTiles(word);
  
  if (isCorrect) {

    updateCombo();

    setTimeout(() => {
      showMessage('HAI VINTO! 🎉', 'green');
    }, 1800);
    return;
  }

  currentRow++;
  currentCol = 0;
  
  if (currentRow === 6) {
    resetCombo();
    setTimeout(() => {
      showMessage(`HAI PERSO! La parola era: ${solution}`, 'red');
    }, 1800);
  }
}



function colorTiles(word) {
  const solutionArray = solution.split('');
  const wordArray = word.split('');
  const tileColors = Array(5).fill('error');
  

  const letterCount = {};
  solutionArray.forEach(letter => {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  });
  
 
  wordArray.forEach((letter, index) => {
    if (letter === solutionArray[index]) {
      tileColors[index] = 'right';
      letterCount[letter]--;
    }
  });
  
 
  wordArray.forEach((letter, index) => {
    if (tileColors[index] !== 'right' && letterCount[letter] > 0) {
      tileColors[index] = 'almost';
      letterCount[letter]--;
    }
  });
  
 
  wordArray.forEach((letter, col) => {
    const tile = getTile(currentRow, col);
    
    setTimeout(() => {
      tile.classList.add('flip');
      
      setTimeout(() => {
        tile.classList.add(tileColors[col]);
        updateKeyColor(letter, tileColors[col]);
      }, 250);
    }, 300 * col);
  });
  
  return tileColors.every(color => color === 'right');
}


function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timeEl.textContent = mins+`:`+secs;
  }, 1000);
}


function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}


function showMessage(text, color) {
  stopTimer();
  gameOver = true;
  messageEl.textContent = text;
  messageEl.style.color = color;
  messageContainer.style.display = 'block';
  messageContainer.classList.add('show');
}


function updateCombo() {

  combo++;
  
  comboEl.classList.add('change');

    setTimeout(()=>{
      comboEl.textContent = combo;
      if (combo >= 5)  comboEl.classList.add('fire');
      if (combo===5) bubbles();

    },500);

  setTimeout(() => comboEl.classList.remove('change'),1000);
}

/*document.addEventListener("DOMContentLoaded",()=>{

  setInterval(()=>{
bubbles();
  },500);
  
});*/


function resetCombo (){
  combo = 0;
  comboEl.textContent = combo;
  comboEl.classList.remove('fire');
}


// RESET GIOCO
retryBtn.addEventListener('click', () => {
  
  tiles.forEach(tile => {
    tile.textContent = '';
    tile.className = 'grid-item';
  });
  
  keys.forEach(key => {
    key.classList.remove('error', 'almost', 'right');
  });
  
  currentRow = 0;
  currentCol = 0;
  gameOver = false;
  timerStarted = false;
  seconds = 0;
  timeEl.textContent = '00:00';
  

  messageContainer.style.display = 'none';
  messageContainer.classList.remove('show');
  

  if (wordList) {
    const randomIndex = Math.floor(Math.random() * wordList.solutions.length);
    solution = wordList.solutions[randomIndex].toUpperCase();
    console.log('Nuova soluzione:', solution);
  }
  
  stopTimer();
});


function bubbles() {
  for (let i = 0; i < 10; i++) {

    const bubble = document.createElement('div');

    bubble.classList.add('bubble');

    bubble.style.left = Math.random() * comboEl.offsetWidth + 'px';
    bubble.style.top = Math.random() * comboEl.offsetHeight + 'px';

    bubbleContainer.appendChild(bubble);

    setTimeout(() => bubble.remove(), 1000);
  }
}


const pageStyle = document.documentElement.style;

theme.addEventListener("change", () => {
  if (theme.checked) {
    document.querySelector('.navbar').style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.66)';
    document.querySelector('.navbar').style.color = 'white';
    document.getElementById('keyboard').style.boxShadow = '0 -2px 10px rgba(255, 255, 255, 0.1)'
    pageStyle.setProperty('--color-bg', 'black');
    
  } else {
    document.querySelector('.navbar').style.boxShadow = '0 0 8px rgba(0, 0, 0, 0.5)';
    document.querySelector('.navbar').style.color = 'black';
    document.getElementById('keyboard').style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.1)'
    pageStyle.setProperty('--color-bg', 'white');
  }
});

