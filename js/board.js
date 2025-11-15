/*
 * Draw the board
 */

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const size = 8;                    // Number of rows/columns (8x8 board)
const tile = canvas.width / size;  // Pixel size of each square

const light = "#f0d9b5";           // Light square color
const dark  = "#b58863";           // Dark square color

// Stores all pieces with their positions for click detection
let pieces = [];

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

/*
 * Draw a piece (circle)
 * color: "white" or "black"
 * r, c: board coordinates
 */
function drawPiece(color, r, c) {
    const x = c * tile + tile / 2;    // Piece center X
    const y = r * tile + tile / 2;    // Piece center Y
    const radius = tile * 0.35;       // Piece radius

    // Save piece data for click detection
    pieces.push({ color, r, c, x, y, radius });

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color === "white" ? "#ffffff" : "#000000";
    ctx.fill();
}

/*
 * Create the initial checkers layout
 * Black = top 3 rows
 * White = bottom 3 rows
 * Only dark squares receive pieces
 */
function createInitialBoard() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            const isDark = (r + c) % 2 === 1;
            if (!isDark) continue; // Skip light squares

            if (r < 3) drawPiece("black", r, c);
            if (r > 4) drawPiece("white", r, c);
        }
    }
}

/*
 * Detect clicks on the board and on pieces
 */
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;  // Mouse X relative to canvas
    const mouseY = e.clientY - rect.top;   // Mouse Y relative to canvas

    // Convert mouse position into board row/column
    const c = Math.floor(mouseX / tile);
    const r = Math.floor(mouseY / tile);

    console.log("Clicked row/column:", r, c);

    // Loop through all pieces to check if one was clicked
    for (const p of pieces) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // If mouse distance is inside piece radius, it's a click
        if (dist <= p.radius) {
            console.log("Clicked piece:", p.color, "at", p.r, p.c);
            highlight(p.r, p.c);
            return;
        }
    }
});

/*
 * Highlight a selected piece
 */
function highlight(r, c) {
    // Redraw the board and pieces
    drawBoard();
    pieces = [];
    createInitialBoard();

    // Find the clicked piece again
    const p = pieces.find(pc => pc.r === r && pc.c === c);
    if (!p) return;

    // Draw a ring outline around the piece
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw possible-move squares (example)
    drawDashedSquare(r+1, c+1);
    drawDashedSquare(r+1, c-1);
    drawDashedSquare(r-1, c+1);
    drawDashedSquare(r-1, c-1);
}

/*
 * Draw a dashed green square inside a board tile
 */
function drawDashedSquare(r, c) {
    const margin = tile * 0.15; // Makes square smaller than tile

    const x = c * tile + margin;
    const y = r * tile + margin;
    const w = tile - margin * 2;
    const h = tile - margin * 2;

    ctx.save();                     // Save drawing state
    ctx.strokeStyle = "green";      
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);        // 6px dash, 4px gap
    ctx.strokeRect(x, y, w, h);
    ctx.restore();                  // Restore state
}

/*
 * Draw everything
 */
drawBoard();
createInitialBoard();