const directions = ['up', 'down', 'left', 'right'];
const multipliers = ['x2', 'x3'];
const colors = ['#6CC5D9', '#F2D857', '#F2B279', '#F2762E', '#DC3A4B', '#0FD081'];

// Document elements
const messageLine = document.getElementById('message-line');
const smallText = document.getElementById('small-text');
const clock = document.getElementById('clock');
const instructions = document.getElementById('instructions');
const mobileButtons = document.getElementById('mobile-buttons');
const mobileUpArrow = document.getElementById('up-arrow');
const mobileLeftArrow = document.getElementById('left-arrow');
const mobileRightArrow = document.getElementById('right-arrow');
const mobileDownArrow = document.getElementById('down-arrow');

// Game data
let actualDirections = [];
let directionsRecorded = [];
let score = 0;
let initialSmallText = '. . .';
let gameStatus = true;
let isTouchEnabled = false;
const startingTimeInterval = 2100;

// Game functions
function selectValueAtRandom(arr) {
    const index = Math.floor(Math.random() * arr.length);
    const direction = arr[index];
    return direction;
}

function checkIfEqual(arrOne, arrTwo) {
    if (arrOne.length === arrTwo.length) {
        for (let i = 0; i < arrOne.length; i++) {
            if (arrOne[i] !== arrTwo[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function buildDirections() {
    const direction = selectValueAtRandom(directions);
    let multiplier;
    let secondDirection; 
    let secondMultiplier;
    
    const shouldContinue = (probability) => {
        const num = Math.ceil(Math.random() * probability);
        if (num === probability) {
            return true;
        }
        return false;
    }

    if (shouldContinue(3) && score > 30) {
        multiplier = selectValueAtRandom(multipliers);
    }

    if (shouldContinue(2) && score > 40) {
        secondDirection = selectValueAtRandom(directions);
    }

    if (secondDirection !== undefined && shouldContinue(3) && score > 60) {
        secondMultiplier = selectValueAtRandom(multipliers);
    }

    let directionsToPrint = [direction];

    const optionalText = [multiplier, secondDirection, secondMultiplier];

    for (text of optionalText) {
        if (text !== undefined) {
            directionsToPrint.push(text);
        }
    }

    return directionsToPrint;

}

function printDirections() {
    let newDirections = buildDirections();
    let message = '';
    for (let i = 0; i < newDirections.length; i++) {
        let j = 1;
        if (directions.includes(newDirections[i])) {
            if (newDirections[i + 1] !== null && multipliers.includes(newDirections[i + 1])) {
                if (newDirections[i + 1] === multipliers[0]) {
                    j = 2;
                } else if (newDirections[i + 1] === multipliers[1]) {
                    j = 3;
                }
            }
            for (let k = 0; k < j; k++) {
                actualDirections.push(newDirections[i]);
            }
        }

        message += '<span style="color:' + colors[i] + '">' + newDirections[i] + ' </span>';
        if (i + 1 === newDirections.length) {
            message = message.substr(0, message.length - 1);
        }
    }
    return message;
}

function checkArrowDirection(event) {
    if (event.defaultPrevented) {
      return;
    }
  
    switch (event.key) {
      case 'ArrowDown':
        directionsRecorded.push('down');
        addTextToSmallText('down');
        break;
      case 'ArrowUp':
        directionsRecorded.push('up');
        addTextToSmallText('up');
        break;
      case 'ArrowLeft':
        directionsRecorded.push('left');
        addTextToSmallText('left');
        break;
      case 'ArrowRight':
        directionsRecorded.push('right');
        addTextToSmallText('right');
        break;
      default:
        return;
    }
}

function checkUserInput() {
    return checkIfEqual(actualDirections, directionsRecorded);
}

function addTextToSmallText(text) {
    const wordColor = getWordColor(directionsRecorded.length - 1);
    if (smallText.innerHTML === initialSmallText) {
        smallText.innerHTML = '<span style="color:' + wordColor + '">' + text + '</span>';
    } else {
        smallText.innerHTML += ', <span style="color:' + wordColor + '">' + text + '</span>';
    }
}

function getWordColor(wordNumber) {
    if (actualDirections[wordNumber] === directionsRecorded[wordNumber]) {
        return colors[5];
    }
    return colors[4];
}

function increaseScore() {
    score += 10;
}

function clearData() {
    actualDirections = [];
    directionsRecorded = [];
}

function getSpeed(score) {
    const multiplier = score/10;
    let newTime = startingTimeInterval;
    if (multiplier > 3) {
        newTime *= (1 - (multiplier/100));
    }
    return newTime;
}

function reloadPage() {
    location.reload();
}

function addInstructions() {
    instructions.style.opacity = .95;
    instructions.style.color = '#FFFFFF';
}

function clearAllIntervals() {
    clearInterval(replaceInterval);
    clearInterval(clockInterval);
}

function updateClock() {
    currentClock = clock.innerHTML;
    const clockArr = currentClock.split(':');
    let minute = parseInt(clockArr[0]); 
    let singleDigitSeconds = parseInt(clockArr[1][1]);
    let doubleDigitSeconds = parseInt(clockArr[1][0]);
    singleDigitSeconds++;

    if (singleDigitSeconds > 9) {
        doubleDigitSeconds++;
        singleDigitSeconds = 0;
    }

    if (doubleDigitSeconds > 5) {
        minute++;
        doubleDigitSeconds = 0;
    }

    if (minute > 59) {
        clock.innerHTML = `ELITE STATUS ACHIEVED`;
    } else {
        clock.innerHTML = `${minute}:${doubleDigitSeconds}${singleDigitSeconds}`;
    }
}

function styleEndGameClock() {
    clock.style.color = colors[3];
}

function setEndGameMessage() {
    messageLine.innerHTML = 'game over';
    smallText.innerHTML = '<span style="color:#F2D857;">score: ' + score + '</span><span style="color:#6CC5D9;"> play again?</span>';
}

function addPlayAgainInstructions() {
    instructions.style.opacity = .95;
    instructions.style.color = '#FFFFFF';
    if (isTouchEnabled) {
        instructions.innerHTML = "Press anywhere";
    } else {
        instructions.innerHTML = "Press any key";
    }
}

function startGame(currentSpeed) {
    clearTimeout(instructionsTimeout);
    window.removeEventListener('click', advanceGame);
    window.removeEventListener('keydown', advanceGame);
    window.removeEventListener('touchend', handleMobileStart);
    window.addEventListener('keydown', checkArrowDirection);
    clock.style.opacity = 1;
    clock.style.color = '#a9a9a9';
    clockInterval = setInterval(updateClock, 1000);
    replaceInterval = setInterval(advanceGame, currentSpeed);
}

function levelUp(currentSpeed) {
    increaseScore();
    clearInterval(replaceInterval);
    replaceInterval = setInterval(advanceGame, currentSpeed);
}

function endGame() {
    gameStatus = false;
    clearAllIntervals();
    window.removeEventListener('keydown', checkArrowDirection);
    if (isTouchEnabled) {
        handleMobileEnd();
    }
    styleEndGameClock();
    setEndGameMessage();
    setTimeout(function() {
        window.addEventListener('keydown', reloadPage);
        window.addEventListener('click', reloadPage);
        window.addEventListener('touchend', reloadPage);
    }, 500);
    instructions.style.opacity = 0;
    playAgainInstructionsTimeout = setTimeout(addPlayAgainInstructions, 1200);
    
}

function advanceGame() {
    const checkGameStatus = checkUserInput();
    let currentSpeed = getSpeed(score);
    if (score > 0) {
        instructions.style.opacity = 0;
        instructions.style.color = '#000000';
    }
    if (checkGameStatus) {
        console.log('Score: ' + score);
        console.log(`Current speed: ${getSpeed(score)} ms`);
        if (actualDirections.length !== 0) {
            levelUp(currentSpeed);
        } else {
            startGame(currentSpeed);
        }
        clearData();
        messageLine.innerHTML = printDirections();
        smallText.innerHTML = initialSmallText;
    } else {
        endGame();
    }
}

function handleMobileStart() {
    isTouchEnabled = true;
    mobileButtons.style.display = 'flex';
    mobileUpArrow.addEventListener('touchend', pressUpArrowKey);
    mobileLeftArrow.addEventListener('touchend', pressLeftArrowKey);
    mobileRightArrow.addEventListener('touchend', pressRightArrowKey);
    mobileDownArrow.addEventListener('touchend', pressDownArrowKey);
    advanceGame();
}

function handleMobileEnd() {
    mobileUpArrow.removeEventListener('touchend', pressUpArrowKey);
    mobileLeftArrow.removeEventListener('touchend', pressLeftArrowKey);
    mobileRightArrow.removeEventListener('touchend', pressRightArrowKey);
    mobileDownArrow.removeEventListener('touchend', pressDownArrowKey);
}

function changeArrowColor(key) {
    key.style.color = '#F2B279';
    setTimeout(function() {
        key.style.color = '#FFFFFF';
    }, 200);
}

function pressUpArrowKey() {
    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowUp'}));
    changeArrowColor(mobileUpArrow);
}

function pressLeftArrowKey() {
    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'}));
    changeArrowColor(mobileLeftArrow);
}

function pressRightArrowKey() {
    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
    changeArrowColor(mobileRightArrow);
}

function pressDownArrowKey() {
    window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowDown'}));
    changeArrowColor(mobileDownArrow);
}

// Start game here
window.addEventListener('click', advanceGame);
window.addEventListener('keydown', advanceGame);
window.addEventListener('touchend', handleMobileStart);

instructionsTimeout = setTimeout(addInstructions, 800);



