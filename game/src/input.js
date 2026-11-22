// VAULTBREAK — keyboard and mouse.
// One clear job: turn browser events into the small input object world.js
// consumes, and translate clicks into canvas coordinates.
export function createInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    clicked: false,
    clickX: 0,
    clickY: 0,
    empPressed: false,
    smokePressed: false,
    confirmPressed: false,
  };

  const keyMap = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
  };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', (event) => {
    const field = keyMap[event.code];
    if (field) {
      input[field] = true;
      event.preventDefault();
      return;
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      input.sneak = true;
      return;
    }
    if (event.code === 'Digit1') {
      input.smokePressed = true;
      return;
    }
    if (event.code === 'Digit2') {
      input.empPressed = true;
      return;
    }
    if (event.code === 'Enter' || event.code === 'Space') {
      input.confirmPressed = true;
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    const field = keyMap[event.code];
    if (field) input[field] = false;
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') input.sneak = false;
  });

  canvas.addEventListener('mousedown', (event) => {
    const point = canvasPoint(event);
    input.clickX = point.x;
    input.clickY = point.y;
    input.clicked = true;
  });

  // Keep the keys from sticking when the window loses focus.
  window.addEventListener('blur', () => {
    input.up = false;
    input.down = false;
    input.left = false;
    input.right = false;
    input.sneak = false;
  });

  return input;
}
