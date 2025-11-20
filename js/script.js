/*
 * 1. Player Pawn
 * 2. Enemy  Pawn
 * 3. Player King
 * 4. Enemy  King
 */

let pieces = [
    [0, 3, 0, 2, 0, 2, 0, 2],
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

const status = document.getElementById("status");
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
    ctx.fillStyle = ((piece == 1 || piece == 3) ? "#ffffff" : (piece == 2 || piece == 4 ? "#000000" : "#666666")); // contraste
    ctx.fill();

    // Label
    let label = ((piece == 1 || piece == 2) ? "Pawn" : (piece == 3 || piece == 4 ? "King" : "---")); // letra correspondente
    ctx.fillStyle = ((piece == 1 || piece == 3) ? "#000000" : (piece == 2 || piece == 4 ? "#ffffff" : "#666666")); // contraste


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


function getChains(r, c, blackPiece, isKing = false, visited = new Set()) {

    const enemyPieces = blackPiece ? [1, 3] : [2, 4];

    let captures = [];
    const dirs = [
        [-1, 1], [-1, -1],
        [1, 1], [1, -1]
    ];

    const key = `${r},${c}`;
    if (visited.has(key)) return [];
    visited.add(key);

    for (let [dr, dc] of dirs) {

        if (isKing) {

            // REI – percorre tudo até achar peça
            let rr = r + dr;
            let cc = c + dc;

            let foundEnemy = false;
            let er = -1, ec = -1;

            while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {

                if (!foundEnemy && enemyPieces.includes(pieces[rr][cc])) {
                    foundEnemy = true;
                    er = rr;
                    ec = cc;
                }
                else if (foundEnemy && pieces[rr][cc] == 0) {

                    captures.push([rr, cc]);

                    const more = getChains(rr, cc, blackPiece, true, new Set(visited));
                    captures.push(...more);
                }
                else if (pieces[rr][cc] != 0 && !foundEnemy) {
                    break;
                }
                else if (foundEnemy && pieces[rr][cc] != 0) {
                    break;
                }

                rr += dr;
                cc += dc;
            }

        } else {

            // PEÃO – captura 2 casas
            const r1 = r + dr;
            const c1 = c + dc;
            const r2 = r + dr * 2;
            const c2 = c + dc * 2;

            if (r2 < 0 || r2 >= 8 || c2 < 0 || c2 >= 8)
                continue;

            if (enemyPieces.includes(pieces[r1][c1]) && pieces[r2][c2] == 0) {

                captures.push([r2, c2]);

                const more = getChains(r2, c2, blackPiece, false, new Set(visited));
                captures.push(...more);
            }
        }
    }

    return captures;
}

function getKingMoves(r, c, blackPiece) {

    const enemy = blackPiece ? [1, 3] : [2, 4];
    let moves = [];

    const dirs = [
        [-1, 1], [-1, -1],
        [1, 1], [1, -1]
    ];

    for (let [dr, dc] of dirs) {

        let rr = r + dr;
        let cc = c + dc;

        let foundEnemy = false;
        let er = -1, ec = -1;

        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {

            if (!foundEnemy && pieces[rr][cc] == 0) {
                moves.push([rr, cc]); // movimento simples
            }
            else if (!foundEnemy && enemy.includes(pieces[rr][cc])) {
                foundEnemy = true;
                er = rr;
                ec = cc;
            }
            else if (foundEnemy && pieces[rr][cc] == 0) {
                moves.push([rr, cc]); // possível captura

                // combos
                const more = getChains(rr, cc, blackPiece, true);
                moves.push(...more);
            }
            else {
                break;
            }

            rr += dr;
            cc += dc;
        }
    }

    return filterMoves(moves);
}



function getPawnMoves(r, c, blackPiece) {
    let moves = [];

    // antes era só 1 ou 2 → AGORA inclui 1/3 ou 2/4
    const enemy = blackPiece ? [1, 3] : [2, 4];

    // ------ MOVIMENTO SIMPLES ------
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

    // ------ CAPTURAS INICIAIS (4 direções) ------
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

        // antes era apenas: pieces[r1][c1] == enemy
        if (enemy.includes(pieces[r1][c1]) && pieces[r2][c2] == 0) {
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

                        // Turn to King
                        if (piece == 1 && r == 0) pieces[r][c] = 3;
                        if (piece == 2 && r == 7) pieces[r][c] = 4;


                        let countMoves = selectedPieceX - r;
                        countMoves *= countMoves < 0 ? -1 : 1; // if negative

                        if (countMoves == 2) { // walked 2 steps
                            let xx = (selectedPieceX + r) / 2;
                            let yy = (selectedPieceY + c) / 2;
                            pieces[xx][yy] = 0; // 
                        }
                        
                        // *** REI COME TUDO NO CAMINHO (MOVIMENTOS > 2) ***
                        if (countMoves > 2) {
                            let dr = (r - selectedPieceX) > 0 ? 1 : -1;
                            let dc = (c - selectedPieceY) > 0 ? 1 : -1;

                            let rr = selectedPieceX + dr;
                            let cc = selectedPieceY + dc;

                            // percorre toda a diagonal até chegar no destino
                            while (!(rr == r && cc == c)) {

                                // se encontrar peça inimiga → remove
                                if (piece == 3 || piece == 1) {
                                    // time branco → inimigo 2 ou 4
                                    if (pieces[rr][cc] == 2 || pieces[rr][cc] == 4) {
                                        pieces[rr][cc] = 0;
//                                        break;
                                    }
                                }

                                if (piece == 4 || piece == 2) {
                                    // time preto → inimigo 1 ou 3
                                    if (pieces[rr][cc] == 1 || pieces[rr][cc] == 3) {
                                        pieces[rr][cc] = 0;
//                                        break;
                                    }
                                }

                                rr += dr;
                                cc += dc;
                            }
                        }

                        pieces[selectedPieceX][selectedPieceY] = 0;
                        selectedPieceX = -1;
                        selectedPieceY = -1;
                        markedSquares = []; // Clear marked squares
                        
                        // TODO:
                        // Antes de setar o próximo turno,
                        // deve verificar se pode comer mais peças
                        // fazer um temporizador pra passar o turno se ficar parado

                        turn = 2;

                    }
                }

            }
        }
    }

    if (!moved) {

        let piece = pieces[r][c];

        markedSquares = []; // Clear marked squares

        if (piece > 0) {

            selectedPieceX = r;
            selectedPieceY = c;

            let moves = [];

            if (piece == 1)
                moves = getPawnMoves(r, c, false);
            if (piece == 2)
                moves = getPawnMoves(r, c, true);
            if (piece == 3)
                moves = getKingMoves(r, c, false);
            if (piece == 4)
                moves = getKingMoves(r, c, true);

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

    let player_1_pieces = 0;
    let player_2_pieces = 0;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (pieces[r][c] == 1 || pieces[r][c] == 3) {
                player_1_pieces += 1;
            }
            if (pieces[r][c] == 2 || pieces[r][c] == 4) {
                player_2_pieces += 1;
            }
//            }
        }
    }

    if (player_2_pieces == 0) {
        status.innerHTML = 'Você venceu!';
    } else if (player_1_pieces == 0) {
        status.innerHTML = 'Player 2 venceu!';
    } else {

        let str_pieces = '';
        str_pieces += '<br>';
        str_pieces += 'Player 1: ' + player_1_pieces + ' peças - ';
        str_pieces += 'Player 2: ' + player_2_pieces + ' peças';


        if (turn == 1) {
            status.innerHTML = 'Sua vez!' + str_pieces;
        }
        if (turn == 2) {
            status.innerHTML = 'Seu adversário está jogando!' + str_pieces;
        }
    }

//    if (turn == 2) {
//        ia();
//    }
}, 100);