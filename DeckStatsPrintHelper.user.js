// ==UserScript==
// @name         Deck Stats Print Utility
// @version      0.7
// @description  Fix printing issues on deck stats
// @author       AlexS
// @match        https://deckstats.net/decks/*proxies=*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @downloadURL  https://github.com/asimovic/DeckStatsPrintHelper/raw/master/DeckStatsPrintHelper.user.js
// @updateURL    https://github.com/asimovic/DeckStatsPrintHelper/raw/master/DeckStatsPrintHelper.user.js
// @connect      mtg-forum.de
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';

  const CORNER_SIZE_FACTOR = 0.02;
  const BORDER_TEST_PIXEL_DIFF = 3;
  const BORDER_TEST_RANGE = 1;
  const BORDER_TEST_THRESHOLD = 0.5;

  // Remove spacing between cards
  let printStyle = `
<style type="text/css">
  @media print {
    hr {
      display: none !important;
    }
    .no_print {
      display: none !important;
    }
    #cards_main {
      overflow: hidden;
      page-break-after: always;
    }
    .card_proxy {
      float:left;
    }
  }
</style>`;

  $(printStyle).appendTo('head');
  $('#cards_main').css('overflow', 'hidden');

  // Add rounded border overlay
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
    }
  })();

  $('#cards_main > img').each(function() {
    let _this = this;

    GM_xmlhttpRequest({
        method: "GET",
        url: normalizeUrl($(this).attr('src')),
        responseType: 'blob',
        onload: function (response) {
          processImage(_this, response.response);
        },
        onerror: function (response) {
            console.log(response);
        }
    });

  });

  function normalizeUrl(url) {
    if (url.startsWith('//')) {
      return location.protocol + url;
    }
    return url;
  }

  function processImage(origImage, imageData) {
    const imageUrl = URL.createObjectURL(imageData);
    const img = new Image();
    img.src = imageUrl;
    img.onload = function() {
      overlayBorderIfNeeded(origImage, this);
    }
  }

  function overlayBorderIfNeeded(origImage, img) {
    let size = Math.round(img.height * CORNER_SIZE_FACTOR);
    let data = getCornerData(img, size, size);
    let lines = getCornerLines(data.data, size, size);

    if (!testBorderExists(lines, size)) {
      console.log('Adding border: ' + origImage.title);
      let div = $(origImage).wrap('<div style="page-break-inside:avoid; width:63mm; height:88mm; float:left;"></div>').parent();

      $(origImage).css('width', '61mm');
      $(origImage).css('height', '86mm');
      $(origImage).css('position', 'absolute');
      $(origImage).css('margin', '1mm');

      let overlay = new Image();
      overlay.src = "http://via.placeholder.com/480x680/880000";
      $(overlay).css('position', 'absolute');
      $(origImage).before($(overlay));

      if ($(origImage).css('display') == 'none') {
        div.css('display', 'none');
      }

      observer.observe(origImage, { attributes : true, attributeFilter : ['style', 'class'] });
    } else {
      console.log('Ignoring: ' + origImage.title);
    }
  }

  function getCornerData(img, width, height) {
    let canvas = getCanvasCached(width, height);

    let ctx = canvas.ctx;
    ctx.drawImage(img, 0, 0);
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