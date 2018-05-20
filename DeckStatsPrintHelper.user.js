// ==UserScript==
// @name         Deck Stats Print Utility
// @version      1.5
// @description  Fix printing issues on deck stats
// @author       AlexS
// @match        https://deckstats.net/deck*proxies=*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @downloadURL  https://github.com/asimovic/DeckStatsPrintHelper/raw/master/DeckStatsPrintHelper.user.js
// @updateURL    https://github.com/asimovic/DeckStatsPrintHelper/raw/master/DeckStatsPrintHelper.meta.js
// @connect      mtg-forum.de
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';

  const CORNER_SIZE = 0.02; //height multiplier
  const BORDER_COLOR_SIZE = 0.01; //height multiplier
  const BORDER_COLOR_LUMA = 100; //luma threshold
  const BORDER_COLOR_THRESHOLD = 0.7; //percent threshold
  const BORDER_TEST_PIXEL_DIFF = 3; //rgb difference
  const BORDER_TEST_RANGE = 1; //max range from height
  const BORDER_TEST_THRESHOLD = 0.5; //percent within range

  let borderSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgkAAALYCAQAAABcCan5AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAIEwAACBMATnDo8YAAAvuSURBVHja7dxNc5XnfcDh3zl6hJAQAozBvNoGY0rTkGQydUPjTjbtql8yn6KLdqYbz9SdqTvTpm5sHDsE4+Aag4OFBEjo5XTBS7GRaJaRdF0LLcSjs/jPnB/3fT/POaPJpJf4tt/2SZ92rS+61Tct9bCX/gHwJ2XcVLMd7EivdaaLXepi55vb9vph61+vt9pqy93ueje73bfdb7WNNk0YdpRJtdlaq93v224133R1vLn2Nd3ohetHW60SNrvVta53o5vd6k6LLXW/lVZaa8MqAXaQUaOmmm5/+zvQwY50vNOd62JvdaLZZ9kYbbdK2GitxT7u3/uvrvZFy621WU2aPPlTYCetEiZNWu9ho0bVuJmOdaGf9bD1zrb/uRxskYSVvu6zPu6TPuvzbnZPBGBXbB6e/txorZUetdJXXe9yb3XySQYmjb6/cXjUV/13/9R7fdlKK623YZqwCzcTU0210KWu9PP+plefS8Lwfx1Z6Yv+sw96v49aNTXYxauG9da73VqTxi304w41PNk+PEvCg37fB/1DH3SrR2YGe8BiH7bRqOV+2pnvniWs92W/6v3+tc/NCfbE5mHSpMU+arpJC73a/ueTsNRH/WP/1i2Tgj2yeXjsXh826nSnOttM44ba7EE3+1Xvdc2jSLDn0nC3X3eh15vudPsaar0b/Ucfd1sQYA9uH2qpq53oQMceJ2Gl3/R+v3GoCHt0+7DR75rtVD9pvqEW+22/7vetbXX9yNBg13Xge+/r9W413fXutNDwdV92o+v94cXHkjy4CHskChvd6Wa/a9TweTe62Tetb7XNqI3u96BNqwXYBSEYN9eBprb6x9W+7nqbDVf7n+5sFYTHlvvn/qXl9m/9MsAOsdFK873b33Zo614sdr2Vhk+60+L29xru916/bLmZxmYKO9hmq8230ZWtk1DL3Wi54XqLLW2fhI2WWmrSQxOFHW+ppe0/y3i/r7rfcLMHPdj+Jcbtb6YVs4RdYKb92633Jz3sTvcbbvXo5d+nOGXLALvEePszwUkrLfaw4W7r/99DSm5Gwu7w0vfyeg961LDUZuve9bDna7HeSlMNq0++VRHY2zZ61Khh3SSAarPNRo4Ogee3D5IAPEcSAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBABJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkAQASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJAJAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQCQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAFAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEIwAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJAJAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQCQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAFAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBABJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkwAkASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAFAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBABJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAJAGQBEASAEkAkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJACQBkARAEgBJAJAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQAkAZAEQBIASQB2ZRJGZgA8MwxN2mzTJIBqmG2zVUmAPW/UqBoOtd6k9SYmAnvauKlGDcd72KMeviwJjhtgtywEXpqEfY0bn+xYcy+7bsOuAnaJzTa2r8XQbHMNr/eHbr3sJVZaNUnYFVZb2f6/+Onm2tdwrrmuNd7uuqkOdrDlZjzBADt8hbDafAeb2m6VMNOhZhsuNteHTbW+9XUH+kVTLbd/uxcCdoSNVprv3Q5sd8GBjrXQ8HZDrzaz3e5gvr/r5206YoQdb9K4ue2SMGq+M73ScLrVTnSslda+f9dhUk210IJZwq5Kwxb3HkYd7M1ONl7oeGc729EXdwZWBrA7jbb61eEu9MPGNd/r/Xknm/6j/hDYfUGo+U71Zucbal8XutvXfWpUsEcbcaSLvd2pjjeuoTNd7u0OmQzsSbOd76dd7GhTj5NwuNf7s37UCXcaYQ+uEY72o37RD5qthqfLhkv9dZt90DdPLvIxKNgLxi30Zu/0bq81PE1CTfdmV9roXh+2VIIAe8LQyS71V13utSc3GIanS4dj/WVDS613tXsmBXtiy/BKl/v7rnTu2aHBUDVp1FSH+0G3W2uqqy21YaUAuzgGQ7Md762u9G5/8dwjCE/OEh470s863IlO9VHXfAASdq3pznaxH3a5S73xnWeShu9e9npHO9IrzbXel609+1bGifMF2MFrgqc/R42aaroT/aR3eqcfd+h7H3J+loSnjz0f6HzjDna2G93ubost97BHrbXRZhNhgB2Wg1FTDe1rf7PNd7jDHe10F7vQ+V558frJC+/xjR51v7t90ad91ufd7JuWuv8kC5IAO8m4qWba38EO92pneqNznetUC801891twosbh6cHjbPNdqSZHnavxb5tuZWmGjfyvALswFXCuKF9zbbQ0U72Rhd6bdvvRPpfACCmxuV2r1YAAAAASUVORK5CYII=";
  let cornersSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgkAAALYAQMAAADMzvMxAAAABlBMVEUAAAD/AAAb/40iAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAAIEwAACBMATnDo8YAAACmSURBVHja7dKxDYNQEETBQwQOKcGluDSuNEqhBEIC5G+7hk0sNFPAS3ZrHJWYR9fYokT9Ep0l1q53Vqhn1xUmlq4zTDy6jjAxd+15Ity0pjxRXf0HCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALinvkeia8sTe1iY8sTcdeSJM0wsXVeeGGHilSfWbyI7xjT6A0VYJjBwx7DQAAAAAElFTkSuQmCC";

  var borderImages = {};
  var cornerImage;

  var printSpacing = 0;
  var roundBorders = true;
  var showCorners = true;

  // Settings
  //----------------------------------------
  let settingsDiv = `
<div class="select_cards" style="width:20%">
  <h2 id="asd">Print Options</h2>
  <label class="option" style="margin-bottom:5px;">
    <input id="printSpacing" type="textbox" style="width:40px;">
    <span>Spacing (mm)</span>
  </label>
  <label class="option">
    <input id="roundBorders" type="checkbox"/>
    <span>Round Borders</span>
  </label>
  <label class="option">
    <input id="showCorners" type="checkbox"/>
    <span>Show Corner Tags</span>
  </label>
</div>`;

  $('.select_cards').css('width', '40%');
  $('.select_cards').last().after(settingsDiv);

  loadOptions();

  $('#printSpacing').keyup(function() {
    let val = $(this).val();
    if (!Number.isNaN(Number.parseFloat(val))) {
      printSpacing = val;
      saveOptions();
      updatePrintSpace();
    }
  });

  $('#roundBorders').change(function(){
    roundBorders = $(this).is(':checked');
    saveOptions();
    updateRoundBorders();
  });

  $('#showCorners').change(function(){
    showCorners = $(this).is(':checked');
    saveOptions();
    updateShowCorners();
  });

  function loadBool(key, def) {
    let val = localStorage.getItem(key);
    if (val === null) {
      return def;
    }
    return val === 'true';
  }

  function loadNumber(key, def) {
    let val = localStorage.getItem(key);
    if (val === null || Number.isNaN(Number.parseFloat(val))) {
      return def;
    }
    return Number.parseFloat(val);
  }

  function loadOptions() {
    if (typeof(Storage) !== 'undefined') {
      printSpacing = loadNumber('printSpacing', printSpacing);
      roundBorders = loadBool('roundBorders', roundBorders);
      showCorners = loadBool('showCorners', showCorners);
    }

    $('#printSpacing').val(printSpacing);
    $('#roundBorders').prop('checked', roundBorders);
    $('#showCorners').prop('checked', showCorners);
  }

  function saveOptions() {
    if (typeof(Storage) !== "undefined") {
      localStorage.printSpacing = printSpacing;
      localStorage.roundBorders = roundBorders;
      localStorage.showCorners = showCorners;
    }
  }

  var createColorBorder = function(borderSrc, r, g, b) {
    return new Promise(resolve => {
      console.log(`Create color border [${r}, ${g}, ${b}]`);
  
      let srcImg = document.createElement('img');
      srcImg.onload = () => {
        let canvas = getCanvasCached(srcImg.width, srcImg.height);
        canvas.ctx.drawImage(srcImg, 0, 0);
  
        //base image is already a black border
        if (r != 0 || g != 0 || b != 0) {
          let data = canvas.ctx.getImageData(0, 0, srcImg.width, srcImg.height);
          let pixelData = data.data;
          
          //base image is grayscale, with alpha fade in middle and white fade on outside
          //tread outside black px as alpha and composite with white background
          for (let pix = 0; pix < srcImg.width * srcImg.height * 4; pix += 4) {
            if (pixelData[pix + 3] > 0) { 
              if (pixelData[pix] == 0) { //full black replace
                pixelData[pix] = r;
                pixelData[pix + 1] = g;
                pixelData[pix + 2] = b;
              } else if (pixelData[pix] < 255) { //composite with white
                let a = pixelData[pix]; //treat black as alpha
                pixelData[pix] = Math.min(255, a + r + a * r / 255.0);
                pixelData[pix + 1] = Math.min(255, a + g + a * g / 255.0);
                pixelData[pix + 2] = Math.min(255, a + b + a * b / 255.0);
              }
            }
          }
  
          canvas.ctx.clearRect(0, 0, srcImg.width, srcImg.height);
          canvas.ctx.putImageData(data, 0, 0);
        }
  
        var img = document.createElement('img');
        img.onload = () => resolve(img);
        img.src = canvas.toDataURL();
      };
  
      srcImg.src = borderSrc;
    });
  };

// Styles
//----------------------------------------
  let borderEnableStyles = `
<style type="text/css" id="border-styles">
  .shink-card {
    width :60.5mm !important;
    height: 85.5mm !important;
    margin: 1.25mm !important;
  }
</style>`;
  let borderDisableStyles = `
<style type="text/css" id="border-styles">
  .card-border {
    display: none !important;
  }
</style>`;
  let cornerDisableStyles = `
<style type="text/css" id="corner-styles">
  .card-corner {
    display: none !important;
  }
</style>`;
  function getPrintSpaceStyles(space) {
    return `
<style type="text/css" id="print-space-styles">
  @media print {
    .print-space {
      margin: ${space}mm;
    }
  }
</style>`;
  }

  let printStyles = `
<style type="text/css">
  .option {
    display: block;
  }
  .card-div {
    page-break-inside: avoid;
    width: 63mm;
    height: 88mm;
    display: inline-block;
  }
  @media print {
    hr {
      display: none !important;
    }
    .no_print {
      display: none !important;
    }
    #cards_main {
      page-break-after: always;
    }
    .card-div {
      float: left;
    }
  }
</style>`;

  // Images
  var loadCornersImg =  function() {
    return new Promise(resolve => {
      let img = document.createElement('img');
      img.onload = () => {
        $(img).css('position', 'absolute');
        $(img).addClass('card-corner');

        cornerImage = img;
        resolve(img);
      };
      img.src = cornersSrc;
    });
  };

  var loadColorBorderImg = function(r, g, b) {
    return new Promise(resolve => {
      if ([r,g,b] in borderImages) {
        resolve((borderImages[[r,g,b]]).cloneNode(true));
      } else {
        createColorBorder(borderSrc, r, g, b).then(img => {
          $(img).css('position', 'absolute');
          $(img).addClass('card-border');

          borderImages[[r,g,b]] = img;
          resolve(img);
        });
      }
    });
  };

  // Remove spacing between cards
  //----------------------------------------
  $(printStyles).appendTo('head');
  $('#cards_main').css('overflow', 'hidden');

  // Add rounded border overlay
  //----------------------------------------
  // Setup
  var cardsRequested = false;
  var cardSets = {};

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(updateCardStyles);
  });

  var getCanvasCached = (function() {
    var canvasCache = document.createElement('canvas');
    canvasCache.ctx = canvasCache.getContext('2d');

    return function(width, height) {
      canvasCache.width = width;
      canvasCache.height = height;

      canvasCache.ctx.clearRect(0, 0, canvasCache.width, canvasCache.height);

      return canvasCache;
    };
  })();

  //Execution
  $('#cards_main > img, #cards_side > img').each(function() {
    let src = normalizeUrl($(this).attr('src'));
    if (!(src in cardSets)) {
      cardSets[src] = [];
    }
    cardSets[src].push(this);

    setupCardStyles(this);
  });

  updateShowCorners();
  updatePrintSpace();
  updateRoundBorders();

  function updateRoundBorders() {
    $('#border-styles').remove();

    if (roundBorders && Object.keys(cardSets).length) {
      $(borderEnableStyles).appendTo('head');
      if (!cardsRequested) {
        requestCards();
      }
    } else {
      $(borderDisableStyles).appendTo('head');
    }
  }

  function updateShowCorners(force) {
    let show = typeof force !== 'undefined' ? force : showCorners;

    $('#corner-styles').remove();
    if (!show) {
      $(cornerDisableStyles).appendTo('head');
    }
  }

  function updatePrintSpace() {
    $('#print-space-styles').remove();
    let styles = getPrintSpaceStyles(printSpacing);
    $(styles).appendTo('head');
  }

  function setupCardStyles(card) {
    //always wrap images to prevent reordering
    let div = $(card).wrap('<div class="card-div print-space"></div>').parent();

    $(card).css('position', 'absolute');

    //card corners
    loadCornersImg().then(corners => {
      $(card).after($(corners));
    });

    if ($(card).css('display') == 'none') {
      div.css('display', 'none');
    }
    observer.observe(card, { attributes : true, attributeFilter : ['style', 'class'] });
  }

  function requestCards() {
    cardsRequested = true;

    for (let src in cardSets) {
      GM_xmlhttpRequest({
        method: "GET",
        url: src,
        responseType: 'blob',
        onload: function (response) {
          const imageUrl = URL.createObjectURL(response.response);
          const img = document.createElement('img');
          img.src = imageUrl;
          img.onload = function() {
            overlayBorderIfNeeded(cardSets[src], this);
          };
        },
        onerror: function (response) {
            console.log(response);
        }
      });
    }
  }

  // Processing
  function overlayBorderIfNeeded(cardSet, img) {
    let size = Math.round(img.height * CORNER_SIZE);
    let data = getImageData(img, 0, 0, size, size);
    let lines = getCornerLines(data.data, size, size);

    let needsBorder = !testBorderExists(lines, size);
    if (needsBorder) {
      var whiteBorder = testBorderWhite(img);
      console.log(`Adding border (${whiteBorder ? 'white' : 'black'}): ${cardSet[0].title}`);

      for (let card of cardSet) {
        $(card).addClass('shink-card');

        //border overlay
        var overlayPromise = whiteBorder ?
          loadColorBorderImg(255, 255, 255) : loadColorBorderImg(0, 0, 0);

        overlayPromise.then(overlay => {
          $(card).after($(overlay));
        });
      }
    } else {
      console.log(`Ignoring: ${cardSet[0].title}`);
    }
  }

  function getImageData(img, x, y, width, height) {
    let canvas = getCanvasCached(width, height);

    let ctx = canvas.ctx;
    ctx.drawImage(img, -x, -y);
    return ctx.getImageData(0, 0, width, height);
  }

  function getCornerLines(pixelData, width, height, pixelDiff) {
    pixelDiff = pixelDiff || BORDER_TEST_PIXEL_DIFF;

    //first pixel
    let r = pixelData[0];
    let g = pixelData[1];
    let b = pixelData[2];
    let a = pixelData[3];

    let lines = new Array(width);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.abs(r - pixelData[(x + y * width) * 4 + 0]) > pixelDiff ||
            Math.abs(g - pixelData[(x + y * width) * 4 + 1]) > pixelDiff ||
            Math.abs(b - pixelData[(x + y * width) * 4 + 2]) > pixelDiff ||
            Math.abs(a - pixelData[(x + y * width) * 4 + 3]) > pixelDiff) {
          lines[x] = y;
          break;
        }
      }

      if (lines[x] === undefined) {
        lines[x] = height;
      }
    }

    return lines;
  }

  function testBorderExists(lines, height, range, threshold) {
    range = range || BORDER_TEST_RANGE;
    threshold = threshold || BORDER_TEST_THRESHOLD;

    let count = 0;

    for (let line of lines) {
      if (Math.abs(height - line) <= range) {
        count++;
      }
    }

    return count / lines.length < threshold;
  }

  function testBorderWhite(img) {
    let width = Math.round(img.height * BORDER_COLOR_SIZE);
    let height = width * 2;
    let x = Math.round(width / 3); //offset from end to avoid borders on borders
    let y = Math.round(img.height / 2 - (height / 2));
    let pixelData = getImageData(img, x, y, width, height).data;

    let countWhite = 0;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let offset = (x + y * width) * 4;

        let luma =
          0.30 * pixelData[offset + 0] +
          0.59 * pixelData[offset + 1] +
          0.11 * pixelData[offset + 2];

        if (luma >= BORDER_COLOR_LUMA) {
          countWhite++;
        }
      }
    }

    return countWhite / width / height >= BORDER_COLOR_THRESHOLD;
  }

  function updateCardStyles(mutationRecord) {
    // Match div and overlay styles with image
    let parent = $(mutationRecord.target).parent();

    if (mutationRecord.attributeName === 'style') {
      if ($(mutationRecord.target).css('display') == 'none') {
        parent.css('display', 'none');
      } else {
        parent.css('display', '');
      }
    } else if (mutationRecord.attributeName === 'class') {
      if ($(mutationRecord.target).hasClass('card_no_print')) {
        parent.addClass('no_print');
        $(mutationRecord.target).siblings().each(function() {
          $(this).addClass('card_no_print');
        });
      } else {
        parent.removeClass('no_print');
        $(mutationRecord.target).siblings().each(function() {
          $(this).removeClass('card_no_print');
        });
      }
    }
  }

  function normalizeUrl(url) {
    if (url.startsWith('//')) {
      return location.protocol + url;
    }
    return url;
  }
})();