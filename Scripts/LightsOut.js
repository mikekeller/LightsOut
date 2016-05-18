/**
 * Lights Out -- An HTML5 game
 * permits users to guess next moves if they desire.
 *
 * MIT License:
 * Copyright (C) 2012 Michael Keller.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function () {
    var gameStateEnum = {
            inPlay: 'INPLAY',
            rePlay: 'REPLAY',
            paused: 'PAUSED',
            showSolution: 'SHOWSOLUTION'
        },
        VERSION = "2.6.1",
        BOARD_SIDE = 5,
        AUDIO_VOLUME = 0.2,
        userAgent = "",
        canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        moveCounter = 0,
        pos = 0,
        programMovesCopy = [],
        programMoves = [],
        colorPalette = [
            'coral', 'cyan', 'green', 'salmon', 'seagreen', 'steelblue'
        ],
        gameState,
        LEVEL,
        REPLAY,
        IN_PLAY,
        startTime,
        lights,
        mouseLocation,
        elapsedTimerId,
        winTimerId,
        themeColor,
        lightThemeColor,
        showSolutionId;

     function getBrowser() {
        "use strict";
        var ua = navigator.userAgent.toLowerCase();
        console.log(ua);
        if (ua.indexOf('safari') !== -1) {
            if (ua.indexOf('chrome') <= -1) {
                // Safari
                userAgent = "Safari";
            }
        }
        if (ua.indexOf('msie') !== -1) {
            userAgent = "msie";
        }
        console.log(userAgent);
    }

     function setThemeColor() {
        "use strict";
        var idx = 5;

        context.fillStyle = colorPalette[idx];
        $('#title').css({ color: colorPalette[idx] });
        lightThemeColor = 'light' + colorPalette[idx];
    }

     function eraseCanvas() {
        "use strict";
        context.fillStyle = themeColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

     function createLightsArray() {
        "use strict";
        var x, y;
        lights = [BOARD_SIDE];    // using literal not -> new Array(BOARD_SIDE);
        for (x = 0; x < BOARD_SIDE; x++) {
            lights[x] = [BOARD_SIDE];
            for (y = 0; y < BOARD_SIDE; y++) {
                lights[x][y] = false;
            }
        }
    }

    /**
     * Toggles state of light clicked and the lights north south east and west of it
     * @param row
     * @param col
     */
     function toggleLights(row, col) {
        "use strict";
        // light clicked
        lights[row][col] = !lights[row][col];

        // north
        if (row < BOARD_SIDE - 1) {
            lights[row + 1][col] = !lights[row + 1][col];
        }
        // south
        if (row > 0) {
            lights[row - 1][col] = !lights[row - 1][col];
        }
        // east
        if (col > 0) {
            lights[row][col - 1] = !lights[row][col - 1];
        }
        // west
        if (col < BOARD_SIDE - 1) {
            lights[row][col + 1] = !lights[row][col + 1];
        }
    }

     function displayNumberMoves (count) {
        "use strict";
        $('#moveCounterDiv').html("<span>Moves: " + count + "</span>");
    }

     function displayElapsedTime(minutes, seconds) {
        "use strict";
        $('#timer').html("<span>Elapsed " + minutes + ":" + seconds + "</span>");
    }

     function displayMoveTracker(moveTracker) {
        "use strict";
        $('#moveTrackerDiv').html(
                "<p>Move Tracker:  " + moveTracker + "</p>");
    }

     function turnAllLightsOff() {
        "use strict";
        var row,
            col,
            level = LEVEL,
            last = 0,
            num = 0;

        // All lights off
        for (row = 0; row < BOARD_SIDE; row++) {
            for (col = 0; col < BOARD_SIDE; col++) {
                lights[row][col] = false;
            }
        }

        while (level > 0) {
            if (!REPLAY) {
                // Ensure each move is different from last move
                while (last === num) {
                    num = Math.floor(Math.random() * Math.pow(BOARD_SIDE, 2));
                }
                last = num;
                programMoves.push(num);
            } else {
                num = programMovesCopy.pop();
            }

            row = Math.floor(num / BOARD_SIDE);
            col = num % BOARD_SIDE;
            toggleLights(row, col);
            level--;
        }
    }

     function displayLights() {
        "use strict";
        var x, y, radGrad, centerX, centerY,
            inc = canvas.width / BOARD_SIDE;
        for (x = 0; x < BOARD_SIDE; x++) {
            for (y = 0; y < BOARD_SIDE; y++) {
                centerX = x * inc + inc / 2;
                centerY = y * inc + inc / 2;

                // Sets or removes highlight
                if (Math.abs(centerX - mouseLocation.x) <=
                    inc / 2 && Math.abs(centerY - mouseLocation.y) <= inc / 2) {
                    context.lineWidth = 5;
                    context.strokeStyle = "purple";
                } else {
                    context.lineWidth = 5;
                    context.strokeStyle = '#FFE6AA';
                }

                // Draws light
                context.save();
                context.beginPath();
                radGrad = context.createRadialGradient(
                    centerX, centerY, inc - 15, centerX - 25, centerY - 25, 0);
                radGrad.addColorStop(0, 'blue');
                radGrad.addColorStop(0.4, 'orange');
                radGrad.addColorStop(0.8, 'yellow');
                radGrad.addColorStop(0.93, '#FAFAFA');
                context.fillStyle = lights[y][x] ? radGrad : lightThemeColor;
                context.arc(centerX, centerY, inc / 2 - 5, 0, 2 * Math.PI, true);
                context.fill();
                context.stroke();
                context.restore();
            }
        }
    }

     function windowToCanvas(x, y) {
        "use strict";
        var bbox = canvas.getBoundingClientRect();

        return {
            x: Math.round(x - bbox.left * (canvas.width / bbox.width)),
            y: Math.round(y - bbox.top * (canvas.height / bbox.height))
        };
    }

     function startElapsedTimer() {
        "use strict";
        var sec = 0;
        elapsedTimerId = setInterval(function () {
            var seconds = utils.pad(++sec % 60),
                minutes = utils.pad(parseInt(sec / 60, 10));
            displayElapsedTime(minutes, seconds);
        }, 1000);
    }

     function stopElapsedTimer() {
        "use strict";
        clearInterval(elapsedTimerId);
    }

     function scrollMessage() {
        "use strict";
        $('#scroll').show();
        winTimerId = setInterval(function () {
            var winTime = $('#timer').text(),
                msg = "  You WON in " + moveCounter + " moves, time " +
                    winTime + ". ",
                scrollDiv = document.getElementById("scroll");

            scrollDiv.firstChild.nodeValue = msg.substring(pos, msg.length) +
                msg.substring(0, pos);
            pos++;
            if (pos > msg.length) {
                // wait 2 seconds before horizontal scrolling begins again
                setTimeout(function () {
                    pos = 1;
                }, 2000);
            }
        }, 200);
    }

     function gameOver() {
        "use strict";
        stopElapsedTimer();
        if (LEVEL === "13") {
            playSound($('#gameOverSound'));
        }
        scrollMessage();
        IN_PLAY = false;
    }

     function areAllLightsOut(BOARD_SIDE) {
        "use strict";
        var allOff = true,
            x,
            y;
        for (x = 0; x < BOARD_SIDE; x++) {
            for (y = 0; y < BOARD_SIDE; y++) {
                if (lights[x][y]) {
                    allOff = false;
                }
            }
        }
        if (allOff) {
            // Let last mousePressSound play before game over sound
            setTimeout(gameOver(), 200);
        }
    }

     function startUp() {
        "use strict";
        startElapsedTimer();
        moveCounter = 0;
        displayNumberMoves(0);
        LEVEL = $('#difficulty').val();
        turnAllLightsOff();
        mouseLocation = { x: 0, y: 0 };
        displayLights();
        document.getElementById('btnReplayGame').disabled = false;
        startTime = (new Date()).getTime();
        IN_PLAY = true;
    }

     function setupButton() {
        "use strict";
        stopElapsedTimer();
        clearTimeout(winTimerId);
        var scrollDiv = document.getElementById("scroll");
        scrollDiv.firstChild.nodeValue = 'Welcome';
        $('#scroll').hide();
    }

     function playSound(sound) {
        "use strict";
        // Stop any sound in progress
        sound[0].pause();
        sound[0].currentTime = 0;
        if (userAgent !== "Safari" && userAgent !== "msie") {
            // Needed cause may not play after first time
            sound[0].load();
        }
        // Set volume and play sound
        sound[0].volume = AUDIO_VOLUME;
        sound[0].play();
    }

     function showHelp() {
        "use strict";
        $("#help-dialog").dialog({
            maxHeight: 500,
            width: 400,
            modal: true,
            dialogClass: "info",
            title: "Help"
        });
    }

     function init() {
        "use strict";
        console.log(Object.keys(window));
        getBrowser();
        $("#version").html("Ver " + VERSION);
        setThemeColor();
        moveCounter = 0;
        createLightsArray();
        eraseCanvas();
        IN_PLAY = false;
        gameState = gameStateEnum.paused;
        utils.setButtonState("enable", ["btnNewGame", "btnHelp"]);
        utils.setButtonState("disable", ["btnReplayGame", "btnShowSolution"]);
    }

     function newGame() {
        "use strict";
        displayMoveTracker('');
        $('#moveTrackerDiv').hide();
        clearInterval(showSolutionId);
        setupButton();
        utils.setButtonState("disable", ["btnShowSolution"]);
        REPLAY = false;
        programMoves.length = 0;
        BOARD_SIDE = $('#boardSize').val();
        eraseCanvas();
        startUp();
        utils.setButtonState("enable", ["btnReplayGame", "btnShowSolution"]);
    }

     function canvasClicked(point) {
        "use strict";
        var inc, col, row;

        utils.setButtonState("disable", ["btnShowSolution"]);
        if (!IN_PLAY) {
            return;
        }
        playSound($('#mouseDownSound'));

        moveCounter++;
        displayNumberMoves(moveCounter);

        inc = canvas.width / BOARD_SIDE;
        col = Math.floor(point.x / inc);
        row = Math.floor(point.y / inc);
        eraseCanvas();
        toggleLights(row, col);
        displayLights();
        areAllLightsOut(BOARD_SIDE);
    }

     function showSolution() {
        var i, num, row, col, inc, xOffset,
            moveTracker = '';

        utils.setButtonState("disable", ["btnShowSolution"]);
        displayMoveTracker(moveTracker);
        $('#moveTrackerDiv').show();
        setupButton();
        IN_PLAY = false;
        displayNumberMoves(0);
        displayElapsedTime(0, 0);
        for (i = 0; i < programMoves.length; i++) {
            programMovesCopy[i] = programMoves[i];
        }
        showSolutionId = setInterval(function () {
            num = programMovesCopy.pop();
            if (num === undefined) {
                clearInterval(showSolutionId);
                return;
            }
            row = Math.floor(num / BOARD_SIDE);
            col = num % BOARD_SIDE;
            inc = canvas.width / BOARD_SIDE;
            mouseLocation.x = col * inc + inc / 2;
            mouseLocation.y = row * inc + inc / 2;
            toggleLights(row, col);
            displayLights();
            num++;
            context.font = "30pt Calibri normal";
            context.strokeStyle = 'purple';
            xOffset = num >= 10 ? 19 : 12;
            context.strokeText(num, mouseLocation.x - xOffset, mouseLocation.y +
                12);
            moveCounter++;
            displayNumberMoves(moveCounter);
            moveTracker += (num).toString() + " ";
            displayMoveTracker(moveTracker);
        }, 2500);
    }

     function replayGame() {
        var i;
        setupButton();
        clearInterval(showSolutionId);
        utils.setButtonState("enable", ["btnShowSolution"]);
        REPLAY = true;
        for (i = 0; i < programMoves.length; i++) {
            programMovesCopy[i] = programMoves[i];
        }
        startUp();
    }

     function setBoardSize() {
        utils.setButtonState("disable", ["btnReplayGame", "btnShowSolution"]);
        eraseCanvas();
    }

// Event handlers *************************************************************
    $('#btnNewGame').on('click', function () {
        "use strict";
        newGame();
    });

    $('#btnReplayGame').on('click', function () {
        "use strict";
        replayGame();
    });

    $('#btnShowSolution').on('click', function () {
        "use strict";
        showSolution();
    });

    $("#btnHelp").on("click", function () {
        "use strict";
        showHelp();
    });

    $("#canvas").on('mousedown', function (event) {
        "use strict";
        var point = windowToCanvas(event.clientX, event.clientY);
        canvasClicked(point);
    });

    $('#boardSize').on('change', function () {
        "use strict";
        setBoardSize();
    });

    $(function () {
        init();
    });
})();
