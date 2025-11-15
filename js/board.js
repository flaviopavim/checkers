const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const size = 8;              // 8x8
const tile = canvas.width / size;

const light = "#f0d9b5";     // light color
const dark = "#b58863";      // dark color

function drawBoard() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {

            // toggle colors
            const isDark = (r + c) % 2 === 1;
            ctx.fillStyle = isDark ? dark : light;

            // draw
            ctx.fillRect(c * tile, r * tile, tile, tile);
        }
    }
}

drawBoard();