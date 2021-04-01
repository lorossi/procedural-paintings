// main function
$(document).ready(() => {
  let canvas, ctx, s;
  // canvas selector
  canvas = $("#sketch")[0];

  // inject canvas in page
  if (canvas.getContext) {
    ctx = canvas.getContext("2d", { alpha: false });
    s = new Sketch(canvas, ctx);
    s.run();
  }

  // wait for sketch load
  if (s != undefined) {
    // handle clicks
    $(canvas).click(() => {
      s.click();
    });

    // handle keypress
    $(document).keypress((e) => {
      if (e.originalEvent.keyCode == 13) {
        // enter
        s.save();
      }
    });
  }

});