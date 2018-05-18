// ==UserScript==
// @name         Deck Stats Print Utility
// @version      1.1
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

  let blackBorderSrc = "data:image/png;base64,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kQAAiAQAQCQAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQBAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAAAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAAAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQBAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAAAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAAAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQ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";
  let whiteBorderSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgkAAALYCAYAAAD2AGFyAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAACBMAAAgTAE5w6PGAAAAB3RJTUUH4gUSACAhfEU0sQAACvNJREFUeNrt3UFO20AYhuHPTqQgCOp1KiF104Nykm4qcaIklCzs6YIpqrqcsbChz7NJhEQ8ihf/a3sQQymlBADgH6OvAAAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBKa+MdQALB9zfN6fO8DAgAfIxT2jQcb6uuU5JLkOcn8188BgPWCYExym+Quya71g/adCzkn+ZHkqb6/6VkMANBlSvKS5JjkIcn3JF/WioRLkp9JHmskHGIzJACsZU5yrZEwJfm6ZiRMSU5JTsMwlCS/nB8AWFcp5VTn89TzOb1X/WNeHzEcnBIA2IxDnc9dc36JRwO7eMQAAFsyZoE9gksNd38SCQDbschcdgcAABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBAAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAAAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQBAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBAAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAAAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQBAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAIgEAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBABAJAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBAAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAACIBAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkAAAiAQAQCQCASAAARAIAgEgAAEQCACASAACRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAAAgEgAAkQAAiAQAQCQAACIBABAJAIBIAABEAgAgEgAAkQAAiAQAQCQAAIgEAEAkAAAiAQAQCQCASAAARAIAIBIAAJEAAIgEAEAkvBl8lQCwGYvM5SUiYUoyOx8AsBlznc+rRsKc5CXJ1fkAgM241vncdRG/71zELsl9kvtSyjnJIfY5AMBa5hoIxzqfd2tGwl2Sb3UR5yQ3vQsCAJpN9Q7CMclDndPNhlJK6VzMJclzrRcbGAFgXSWvd/VvayQ0X7y3RsKf3xEFALD9aGia2a37B8QBAHwcTXN7fO8DAgDbD4TeSAAAPjGRAACIBABAJAAAIgEAEAkAgEgAAEQCACASAACRAACIBABAJAAA/4nf9xxOxDNyKmsAAAAASUVORK5CYII=";
  let cornersSrc = "data:image/png;base64,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";

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

// Styles
//----------------------------------------
  let borderEnableStyles = `
<style type="text/css" id="border-styles">
  .shink-card {
    width :62mm;
    height: 87mm;
    margin: 0.5mm;
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

  $('#cards_main > img').each(function() {
    let src = normalizeUrl($(this).attr('src'));
    if (!(src in cardSets)) {
      cardSets[src] = [];
    }
    cardSets[src].push(this);
  });

  console.log('found ' + Object.keys(cardSets).length);

  function normalizeUrl(url) {
    if (url.startsWith('//')) {
      return location.protocol + url;
    }
    return url;
  }

  //Execution
  updateRoundBorders();
  updatePrintSpace();

  function updateRoundBorders() {
    $('#border-styles').remove();

    if (roundBorders && Object.keys(cardSets).length) {
      $(borderEnableStyles).appendTo('head');
      updateShowCorners();
      if (!cardsRequested) {
        requestCards();
      }
    } else {
      $(borderDisableStyles).appendTo('head');
      updateShowCorners(false);
    }
  }

  function updateShowCorners(force) {
    let show = typeof force !== 'undefined' ? force : showCorners

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

  function requestCards() {
    cardsRequested = true;

    for (let src in cardSets) {
      GM_xmlhttpRequest({
        method: "GET",
        url: src,
        responseType: 'blob',
        onload: function (response) {
          processImage(cardSets[src], response.response);
        },
        onerror: function (response) {
            console.log(response);
        }
      });
    }
  }

  // Processing
  function processImage(cardSet, imageData) {
    const imageUrl = URL.createObjectURL(imageData);
    const img = new Image();
    img.src = imageUrl;
    img.onload = function() {
      overlayBorderIfNeeded(cardSet, this);
    };
  }

  function overlayBorderIfNeeded(cardSet, img) {
    let size = Math.round(img.height * CORNER_SIZE);
    let data = getImageData(img, 0, 0, size, size);
    let lines = getCornerLines(data.data, size, size);

    let needsBorder = !testBorderExists(lines, size);
    if (needsBorder) {
      console.log('Adding border: ' + cardSet[0].title);
    } else {
      console.log('Ignoring: ' + cardSet[0].title);
    }

    for (let card of cardSet) {
      //always wrap images to prevent reordering
      let div = $(card).wrap('<div class="card-div print-space"></div>').parent();

      $(card).css('position', 'absolute');

      //card corners
      let corners = new Image();
      corners.src = cornersSrc;
      $(corners).css('position', 'absolute');
      $(corners).addClass('card-corner');
      $(card).after($(corners));

      if (needsBorder) {
        $(card).addClass('shink-card');

        let white = testBorderWhite(img);

        //border overlay
        let overlay = new Image();
        overlay.src = white ? whiteBorderSrc : blackBorderSrc;
        $(overlay).css('position', 'absolute');
        $(overlay).addClass('card-border');
        $(card).after($(overlay));
      }

      if ($(card).css('display') == 'none') {
        div.css('display', 'none');
      }
      observer.observe(card, { attributes : true, attributeFilter : ['style', 'class'] });
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

})();