export type TetrominoNames = "I" | "O" | "T" | "S" | "Z" |"J" | "L"

export class Tetromino {
  layout: Array<string>;
  name: TetrominoNames;
  rotation?: number;

  constructor(layout: Array<string>, name: TetrominoNames, rotation: number = 0) {
    this.layout = layout;
    this.rotation = rotation;
    this.name = name;
  }

  rotate() {
    let temp: Array<Array<string>> = [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]];
    let rotated: Array<string> = [];

    for (let i = 0; i < 4; i++) {
      const tempRow = []
      for (let j = 0; j < 4; j++) {
        console.log(i, j)
        temp[i][j] = this.layout[j][i]
        temp[j][i] = this.layout[i][j]
      }
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        const _temp = temp[i][j];
        temp[i][j] = temp[i][4 - j - 1];
        temp[i][4 - j - 1] = _temp;
      }
    }

    for (let i = 0; i < 4; i++) {
      rotated[i] = temp[i].join("");
    }

    return rotated
  }
}

export const Tetrominoes = [
  new Tetromino([
    "  X ",
    "  X ",
    "  X ",
    "  X ",
  ], "I"),
  new Tetromino([
    "  X ",
    " XX ",
    " X  ",
    "    ",
  ], "S"),
  new Tetromino([
    " X  ",
    " XX ",
    "  X ",
    "    ",
  ], "Z"),
  new Tetromino([
    "  X ",
    " XX ",
    "  X ",
    "    ",
  ], "T"),
  new Tetromino([
    "  X ",
    "  X ",
    " XX ",
    "    ",
  ], "J"),
  new Tetromino([
    "  X ",
    "  X ",
    "  XX",
    "    ",
  ], "L"),
  new Tetromino([
    "    ",
    " XX ",
    " XX ",
    "    ",
  ], "O"),
]