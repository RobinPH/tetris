import { EventEmitter } from 'events';
import { Tetromino, Tetrominoes, TetrominoNames } from './tetromino';
import Vector from './vector';
import { timer } from 'rxjs';

export interface TetrisSetting {
  width?: number;
  height?: number;
  cellSize?: number;
  gameTick?: number;
}

const defaultSetting: TetrisSetting = {
  width: 10,
  height: 20,
  cellSize: 15,
  gameTick: 5,
}

enum CellColors {
  "#" = "#000000",
  " " = "#FFFFFF",
  "-" = "#123456",
  "I" = "lightblue",
  "O" = "yellow",
  "T" = "purple",
  "S" = "green",
  "Z" = "red",
  "J" = "blue",
  "L" = "orange",
}

enum SpecialBlocks {
  WALL = "#",
  LINE = "-",
  SPACE = " ",
}

type SpecialBlock = "#" | "-" | " "

export default class Tetris extends EventEmitter {
  private context: CanvasRenderingContext2D;
  private tetrisSetting: TetrisSetting;
  private Game: Array<Array<TetrominoNames | SpecialBlock>> = [];

  private rotation: number;
  private currentTetromino: Tetromino;
  private position: Vector;

  private gameOver: Boolean;

  private score: number;

  constructor(canvas: HTMLCanvasElement, tetrisSetting: TetrisSetting = defaultSetting) {
    super();

    this.tetrisSetting = { ...defaultSetting, ...tetrisSetting };
    const { width, height, cellSize } = this.tetrisSetting;

    canvas.width = (width! + 2) * cellSize!;
    canvas.height = (height! + 2) * cellSize!;

    this.context = canvas.getContext('2d')!;

    this.rotation = 0;
    this.currentTetromino = Tetrominoes[Math.floor(Math.random() * 7)];;
    this.position = new Vector(width! / 2, 0);

    this.gameOver = false;

    this.score = 0;

    window.addEventListener('keydown', e => { this.manualMovement(e) });
  }

  start() {
    const { width, height } = this.tetrisSetting;

    for (let i = 0; i <= height! + 1; i++) {
      const row: Array<TetrominoNames | SpecialBlock> = [];
      for (let j = 0; j <= width! + 1; j++) {
        row[j] = " ";
        if (j === 0 || j === width! + 1 || i === height! + 1) row[j] = "#"
      }
      this.Game.push(row);
    }
  }

  update() {
    timer(1000 / this.tetrisSetting.gameTick!).subscribe(() => {
      if (this.gameOver) return
      const { width, height, cellSize } = this.tetrisSetting;

      this.context.fillStyle = 'yellow';
      this.context.fillRect(0, 0, (width! + 2) * cellSize!, (height! + 2) * cellSize!);

      this.updateBoard();
      this.drawTetromino(this.position, this.currentTetromino, this.rotation, true);

      document.querySelector("#score")!.innerHTML = this.score.toString();

      return this.update();
    });
  }

  private updateBoard() {
    const { width, height } = this.tetrisSetting;

    for (let i = 0; i <= height! + 1; i++) {
      for (let j = 0; j <= width! + 1; j++) {
        this.drawCell(new Vector(j, i), this.Game[i][j]);
      }
    }
  }

  private drawCell(position: Vector, tetromino: TetrominoNames | SpecialBlock) {
    const { cellSize } = this.tetrisSetting;
    const { x, y } = position;

    this.context.fillStyle = CellColors[tetromino];
    this.context.fillRect(x * cellSize!, y * cellSize!, cellSize!, cellSize!);
  }

  private drawTetromino(position: Vector, tetromino: Tetromino, rotation: number, updateY?: boolean) {
    const { x, y } = position;
    const { layout, name } = tetromino

    for (let i = y; i < y + 4; i++) {
      for (let j = x; j < x + 4; j++) {
        if (layout[i - y][j - x] === "X")
          this.drawCell(new Vector(j, i), name)
      }
    }
    if (updateY) {
      if (this.doesTetrominoFit(new Vector(x, y + 1), tetromino)) {
        this.position.y++;
        this.removeCompleteLine();
      } else{
        for (let i = y; i < y + 4; i++) {
          for (let j = x; j < x + 4; j++) {
            if (layout[i - y][j - x] === "X") {
              this.Game[i][j] = tetromino.name;
            }
          }
        }

        this.rotation = 0;
        this.currentTetromino = Tetrominoes[Math.floor(Math.random() * 7)];
        this.position = new Vector(this.tetrisSetting.width! / 2, 0);

        if (!this.doesTetrominoFit(this.position, this.currentTetromino)) {
          this.gameOver = true
          console.log("Game Over")
        }
      }
    }
  }

  private doesTetrominoFit(position: Vector, tetromino: Tetromino) {
    const { x, y } = position;
    const { layout } = tetromino

    for (let i = y; i < y + 4; i++) {
      for (let j = x; j < x + 4; j++) {
        if (layout[i - y][j - x] === "X") {
          if (this.Game[i][j] != " ") return false;
        }
      }
    }

    return true;
  }

  private manualMovement(e: KeyboardEvent) {
    const { x, y } = this.position;

    switch (e.key) {
      case "ArrowRight":
        if (this.doesTetrominoFit(new Vector(x + 1, y), this.currentTetromino))
          this.position.x++;
        return;
      case "ArrowLeft":
        if (this.doesTetrominoFit(new Vector(x - 1, y), this.currentTetromino))
          this.position.x--;
        return;
      case "ArrowDown":
        if (this.doesTetrominoFit(new Vector(x, y + 1), this.currentTetromino))
          this.position.y++;
        return;
      case "z":
        const tempRotated: Tetromino = new Tetromino(this.currentTetromino.rotate(), this.currentTetromino.name, this.currentTetromino.rotation);
        if (this.doesTetrominoFit(this.position, tempRotated))
          this.currentTetromino = tempRotated;
        return;
      case " ":
        while (this.doesTetrominoFit(new Vector(x, this.position.y + 1), this.currentTetromino)) {
          this.position.y++;
        }
        this.removeCompleteLine();
        return;
    }
  }

  private checkLine() {
    const lines: number[] = []
    for (let i = 0; i <= this.tetrisSetting.height!; i++)
      if (this.Game[i].every(c => c != " ")) lines.push(i)
    return lines
  }

  private removeCompleteLine() {
    let lines = this.checkLine();

    if (lines.length > 0) {
      this.score += 250 + lines.length * 100;
      for (let i of lines) {
        while (i >= 1) {
          this.Game[i] = this.Game[--i]
        }
      }
    }
  }
}