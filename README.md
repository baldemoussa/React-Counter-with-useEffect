# Advanced Counter

A React counter on a pale slate page. Increment and Decrement move the count by the current step.

## Description

The history lists every count. After a short wait, the count, step, and history are saved in the browser under the key `advanced-counter-state`.

On a first visit the count is 0, the step is 1, and the history is `0`. The status starts as **Saving...** and changes to **Saved to local storage** about 400ms later. Another change before that wait finishes cancels the pending save and starts a new one.

* Decrement subtracts the step. Increment adds it. The count can go below zero.
* Reset sets the count and the history back to `0`. It leaves the step as it is.
* ArrowUp and ArrowDown do the same as Increment and Decrement. While the step field is focused, those keys stay in the field and do not change the count.
* The saved value is JSON with `count`, `step`, and `history`. A later visit restores that snapshot. If the stored value is missing or not valid, the counter starts at 0 again.

Changing the step does not add a history entry. After three increments the history is `0, 1, 2, 3`. A step of 5 then jumps the next Increment from 3 to 8, so the history is `0, 1, 2, 3, 8`.

## Screenshots

### Start

![Counter at 0 with step 1 and history 0](docs/screenshots/start.png)

### Three increments

![Counter at 3 with history 0, 1, 2, 3](docs/screenshots/incremented.png)

### Step of 5

![Counter at 8 with step 5 and history 0, 1, 2, 3, 8](docs/screenshots/step.png)

## Getting Started

### Dependencies

* Node.js and npm

### Installing

```bash
npm install
```

### Executing program

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173/`.

## Help

The status stays **Saving...** until about 400ms after the last change, then reads **Saved to local storage**. A stored value that is missing or not valid starts the counter at 0 again. Arrow keys do not change the count while the step field is focused.

## Authors

[Mamadou Moussa Balde](https://www.linkedin.com/in/2mb/)

## Version History

* Current local run
    * Vite at `http://localhost:5173/`
    * Count moved 0, then 3, then 8 with step 5

## License

This folder does not include a `LICENSE.md` file.

## Acknowledgments

* [README template](https://gist.github.com/DomPizzie/7a5ff55ffa9081f2de27c315f5018afc)
