# Blokus (Local, Human vs CPU) — README

A lightweight, browser-only Blokus-style game. Play locally with up to 4 players, mixing humans and CPUs, directly from a single HTML file.

<!-- ### You can play it here: https://piwebswiss.github.io/blokus/
 -->
![alt text](<image/Screenshot 2025-10-25 143510.png>)

---

## What you can do

* **2–4 players** on one device.
* Mix **Human** and **CPU** seats.
* **CPU difficulty**: Easy / Medium / Hard.
* **Full 21-piece set per player** (standard Blokus).
* **Mouse & keyboard controls**:

  * Rotate piece: **R** or **mouse wheel** (trackpad scroll).
  * Flip piece: **F** or **right-click**.
* **Scoring** displayed live.
* **End-of-game overlay**: “Good! You win / You lose / Tie”.
* Works entirely **offline**—no server required.

---

## 🚀 Quick start

   * Choose **Players** (2–4).
   * For each seat, pick **Human** or **CPU** and set a name.
   * Optionally pick **CPU level** on the top-right.
   * Click **Start Game**.

---

---

## 🎮 How to play

### Goal

Place as many of your pieces on the 20×20 board as you can. Your **score** is the number of squares you’ve placed.

### Turn order

Players take turns. The current player is shown next to **Turn**.

### Rules (Blokus-like)

* **First move**: must cover **your start corner**:

  * Player 1 → top-left (0,0)
  * Player 2 → bottom-right (19,19)
  * Player 3 → bottom-left (0,19)
  * Player 4 → top-right (19,0)
* **After the first move**:

  * Your new piece must **touch at least one of your existing pieces by a corner**.
  * **Edge-to-edge contact with your own pieces is NOT allowed.**
* You can **rotate** or **flip** a piece before placing it.
* If you can’t move, click **Skip Turn**.

### Controls

* **Select a piece**: click it from your palette on the right.
* **Preview on board**: move your cursor over the board; valid cells are highlighted.
* **Place on board**: click a cell.
* **Rotate**: press **R** or use **mouse wheel / trackpad scroll**.
* **Flip**: press **F** or **right-click**.
* **Skip**: click **Skip Turn**.
* **New match**: click **New Match** (top-right).

> CPU turns show a short “thinking…” overlay.

---

## 🧠 CPU levels

* **Easy**: random legal move.
* **Medium**: prefers larger pieces.
* **Hard**: heuristic mix: piece size, board centrality, and future mobility.

---

## 📦 Project files

* `index.html`
  Main page and UI layout.

* `game.js`
  Game logic, rules, CPU, rendering, and input handling.

* `output.css`
  Tailwind build CSS

Chat GPT links:
- [chat 1](https://chatgpt.com/canvas/shared/68fcc684ac1c8191821c244e5ddec899)
- [chat 2](https://chatgpt.com/share/68fcc607-0b7c-800e-84e0-d46989ac3825)

