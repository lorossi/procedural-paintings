document.addEventListener("DOMContentLoaded", () => {
  // page loaded
  let canvas, ctx, s;

  canvas = document.querySelector("#sketch");
  // inject canvas in page
  if (canvas.getContext) {
    ctx = canvas.getContext("2d", { alpha: false });
    s = new Sketch(canvas, ctx, 240);
    s.run();
  }

  if (s != undefined) {
    canvas.addEventListener("click", () => {
      s.click();
    });

    document.addEventListener("keydown", e => {
      if (e.key == "Enter") {
        s.save();
      } else if (e.key == "KeyR") {
        recording = !recording;

        if (recording) {
          s.reset();
        }
      }
    });
  }
});