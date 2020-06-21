import Tetris from "./scripts/tetris";

const canvas: HTMLCanvasElement = document.getElementById('tetris') as HTMLCanvasElement;

const foo = new Tetris(canvas, { cellSize: 25 });

foo.start();
foo.update();