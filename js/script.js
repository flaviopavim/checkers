/*
 * 1. Player Pawn
 * 2. Enemy  Pawn
 * 3. Player King
 * 4. Enemy  King
 */

let pieces = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
];

/*
 * Draw the board
 */

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const size = 8;                    // Number of rows/columns (8x8 board)
const tile = canvas.width / size;  // Pixel size of each square

const light = "#f0d9b5";           // Light square color
const dark = "#b58863";           // Dark square color
//            const light = "#74b9ff";
//            const dark = "#0984e3";

// Draws the 8x8 checkerboard
function drawBoard() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            // Dark squares appear when row+col is odd
            const isDark = (r + c) % 2 === 1;

            ctx.fillStyle = isDark ? dark : light;
            ctx.fillRect(c * tile, r * tile, tile, tile);
        }
    }
}

drawBoard();

/*
 * Draw pieces
 */

function drawPiece(r, c) {

    const piece = pieces[r][c]; // <-- pega a peça correta!

    const x = c * tile + tile / 2;    // center X
    const y = r * tile + tile / 2;    // center Y
    const radius = tile * 0.35;       // radius

    // Circle base
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = piece == 1 ? "#ffffff" : "#000000"; // branca ou preta
    ctx.fill();

    // Label
    const label = "Pawn"; // letra correspondente
    ctx.fillStyle = piece == 1 ? "#000000" : "#ffffff"; // contraste
    ctx.font = (tile * 0.18) + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y);
}

function drawPieces() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (pieces[r][c] > 0) {
                drawPiece(r, c);
            }
        }
    }
}

drawPieces();


/*
 * Game functions
 */

function verifyPoints(pieces, player) {

    /*
     * Verify a player's points.
     * Used to determine the winner
     * in case of a draw.
     * 
     * The minimum is 1
     * 0 means game over.
     */

    let points = 0;
    for (let r = 0; r < pieces.length; r++) {
        for (let c = 0; c < pieces[r].length; c++) {
            if (player == 1 && (pieces[r][c] == 1 || pieces[r][c] == 3)) {
                points += 1;
            }
            if (player == 2 && (pieces[r][c] == 2 || pieces[r][c] == 4)) {
                points += 1;
            }
        }
    }
    return points;
}

let turn = 1; // 0 - not started, 1 - white piece, 2 - black piece
let selectedPieceX = -1; // Selected piece
let selectedPieceY = -1; // Selected piece

/*
 * GET MOVES
 * some functions that returns possible moves
 */

function filterMoves(moves) {

    // Filter moves inside board

    let filteredMoves = [];
    for (let i = 0; i < moves.length; i++) {
        if (
                moves[i][0] >= 0 && moves[i][0] <= 7 &&
                moves[i][1] >= 0 && moves[i][1] <= 7
                ) {
            filteredMoves.push([moves[i][0], moves[i][1]]);
        }
    }

    return filteredMoves;
}

function getBishopMoves(r, c) {

    let moves = [];

    // Generate diagonal moves in all 4 directions
    for (let i = 1; i <= 8; i++) {
        if (r + i < 8 && c + i < 8) {
            if (pieces_white[r + i][c + i] > 0) { // if has white piece
                break;
            }
            // Down-right diagonal
            moves.push([r + i, c + i]);
            if (pieces_black[r + i][c + i] > 0) { // if has black piece
                break;
            }
        }
    }

    for (let i = 1; i <= 8; i++) {
        if (r + i < 8 && c - i >= 0) {
            if (pieces_white[r + i][c - i] > 0) { // if has white piece
                break;
            }
            // Down-left diagonal
            moves.push([r + i, c - i]);
            if (pieces_black[r + i][c - i] > 0) { // if has black piece
                break;
            }
        }
    }

    for (let i = 1; i <= 8; i++) {
        if (r - i >= 0 && c + i < 8) {
            if (pieces_white[r - i][c + i] > 0) { // if has white piece
                break;
            }
            // Up-right diagonal
            moves.push([r - i, c + i]);
            if (pieces_black[r - i][c + i] > 0) { // if has black piece
                break;
            }
        }
    }

    for (let i = 1; i <= 8; i++) {
        if (r - i >= 0 && c - i >= 0) {
            if (pieces_white[r - i][c - i] > 0) { // if has white piece
                break;
            }
            // Up-left diagonal
            moves.push([r - i, c - i]);
            if (pieces_black[r - i][c - i] > 0) { // if has black piece
                break;
            }
        }
    }

    // Apply extra filtering (board limits, collisions, etc)
    moves = filterMoves(moves);

    return moves;
}

function getChains(r, c, blackPiece, visited = new Set()) {
    const enemy = blackPiece ? 1 : 2;
    let captures = [];

    const dirs = [
        [-1, 1], // up-right
        [-1, -1], // up-left
        [1, 1], // down-right
        [1, -1]    // down-left
    ];

    const key = `${r},${c}`;
    if (visited.has(key))
        return [];
    visited.add(key);

    for (let i = 0; i < dirs.length; i++) {
        const dr = dirs[i][0];
        const dc = dirs[i][1];

        const r1 = r + dr;
        const c1 = c + dc;
        const r2 = r + dr * 2;
        const c2 = c + dc * 2;

        if (r2 < 0 || r2 >= 8 || c2 < 0 || c2 >= 8)
            continue;

        if (pieces[r1][c1] == enemy && pieces[r2][c2] == 0) {
            captures.push([r2, c2]);

            const more = getChains(r2, c2, blackPiece, new Set(visited));
            captures.push(...more);
        }
    }

    return captures;
}

function getPawnMoves(r, c, blackPiece) {
    let moves = [];

    const enemy = blackPiece ? 1 : 2;

    // ------ MOVIMENTO SIMPLES (igual estava!) ------
    if (!blackPiece) {
        if (r - 1 >= 0) {
            if (c + 1 < 8 && pieces[r - 1][c + 1] == 0)
                moves.push([r - 1, c + 1]);
            if (c - 1 >= 0 && pieces[r - 1][c - 1] == 0)
                moves.push([r - 1, c - 1]);
        }
    } else {
        if (r + 1 < 8) {
            if (c + 1 < 8 && pieces[r + 1][c + 1] == 0)
                moves.push([r + 1, c + 1]);
            if (c - 1 >= 0 && pieces[r + 1][c - 1] == 0)
                moves.push([r + 1, c - 1]);
        }
    }

    // ------ CAPTURAS INICIAIS (em 4 direções) ------
    const dirs = [
        [-1, 1],
        [-1, -1],
        [1, 1],
        [1, -1]
    ];

    for (let i = 0; i < dirs.length; i++) {
        const dr = dirs[i][0];
        const dc = dirs[i][1];

        const r1 = r + dr;
        const c1 = c + dc;
        const r2 = r + dr * 2;
        const c2 = c + dc * 2;

        if (r2 < 0 || r2 >= 8 || c2 < 0 || c2 >= 8)
            continue;

        if (pieces[r1][c1] == enemy && pieces[r2][c2] == 0) {
            moves.push([r2, c2]);
        }
    }

    // ------ CAPTURAS EM PROGRESSÃO (combo) ------
    const chains = getChains(r, c, blackPiece);
    moves.push(...chains);

    moves = filterMoves(moves);
    return moves;
}

/*
 * HIGHLIGHT
 */

let markedSquares = [];

function drawMarkedSquares() {
    for (let i = 0; i < markedSquares.length; i++) {

        const r = markedSquares[i][0];
        const c = markedSquares[i][1];

        const x = c * tile;
        const y = r * tile;

        const margin = tile * 0.15; // margem para deixar no centro
        const size = tile - margin * 2;

        ctx.strokeStyle = "#00b894";    // verde
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);        // dashed

        ctx.strokeRect(x + margin, y + margin, size, size);

        ctx.setLineDash([]); // reseta (importante)
    }
}


function redrawAll() {
    drawBoard();
    drawPieces();
    drawMarkedSquares();
}

/*
 * Click
 */

canvas.addEventListener("click", function (e) {

//                if (turn == 1) {

    const rect = canvas.getBoundingClientRect();

    // posição real do clique dentro do canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // converte coordenadas → quadrado
    const c = Math.floor(x / tile); // coluna
    const r = Math.floor(y / tile); // linha

    console.log("Quadrado clicado:", r, c);

    let moved = false;

    if (selectedPieceX != -1) {
        for (let i = 0; i < markedSquares.length; i++) {
            if (markedSquares[i]) {

                let x = markedSquares[i][0];
                let y = markedSquares[i][1];

                if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                    if (x == r && y == c) {
                        moved = true;

                        let piece = pieces[selectedPieceX][selectedPieceY];

                        pieces[r][c] = piece;


                        if (piece == 1 && r == 0) {
                            //chegou no fim, vira dama
                        }
                        if (piece == 2 && r == 8) {
                            //chegou no fim, vira dama
                        }


                        let countMoves = selectedPieceX - r;
                        countMoves *= countMoves < 0 ? -1 : 1; // if negative

                        if (countMoves == 2) { // walked 2 steps
                            let xx = (selectedPieceX + r) / 2;
                            let yy = (selectedPieceY + c) / 2;
                            pieces[xx][yy] = 0; // 
                        }

                        pieces[selectedPieceX][selectedPieceY] = 0;
                        selectedPieceX = -1;
                        selectedPieceY = -1;
                        markedSquares = []; // Clear marked squares

                        turn = 2;

                    }
                }

            }
        }
    }

    if (!moved) {
        //} else  {

        let piece = pieces[r][c];

        //selectedPieceX=-1;
        //selectedPieceY=-1;
        markedSquares = []; // Clear marked squares

        if (piece > 0) {
//                            console.log("Peça branca:", labels[pieceW - 1]);

            selectedPieceX = r;
            selectedPieceY = c;

            let moves = [];

            if (piece == 1)
                moves = getPawnMoves(r, c, false);
            if (piece == 2)
                moves = getPawnMoves(r, c, true);


            for (let i = 0; i < moves.length; i++) {
                markedSquares.push([moves[i][0], moves[i][1]]);
            }


        }
    }

    redrawAll();

});

/*
 * Cursor
 */

canvas.addEventListener("mousemove", function (e) {

//                const rect = canvas.getBoundingClientRect();
//                const x = e.clientX - rect.left;
//                const y = e.clientY - rect.top;
//
//                const c = Math.floor(x / tile); // coluna
//                const r = Math.floor(y / tile); // linha
//
//                // Detectar se está em markedSquares
//                let isMarked = false;
//                for (let i = 0; i < markedSquares.length; i++) {
//                    if (markedSquares[i][0] === r && markedSquares[i][1] === c) {
//                        isMarked = true;
//                        break;
//                    }
//                }
//
//                // Se tiver peça branca OU for um quadrado marcado → pointer
//                if (pieces_white[r][c] > 0 || isMarked) {
//                    canvas.style.cursor = "pointer";
//                } else {
//                    canvas.style.cursor = "default";
//                }

});

/*
 * Machine moves
 */

function ia() {
    turn = 1;
}

window.setInterval(function () {
    if (turn == 2) {
        ia();
    }
}, 100);