const Input = {
  keys: {},
  mouseX: W / 2,
  mouseY: H / 2,

  get vector() {
    let x = 0, y = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp'])    y -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown'])  y += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft'])  x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
    const len = Math.hypot(x, y);
    if (len > 0) { x /= len; y /= len; }
    return { x, y };
  },
};

window.addEventListener('keydown', e => { Input.keys[e.code] = true; });
window.addEventListener('keyup',   e => { Input.keys[e.code] = false; });

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  Input.mouseX = e.clientX - r.left;
  Input.mouseY = e.clientY - r.top;
});
