// ==UserScript==
// @name         Deck Stats Print Utility
// @version      0.5
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

  let printStyle = `
<style type="text/css">
@media print {
  hr {
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

$('#cards_main > img').each(function() {

    //check condition
    let div = $(this).wrap('<div style="page-break-inside:avoid; width:63mm; height:88mm; float:left;"></div>')

    $(this).css('width', '61mm');
    $(this).css('height', '86mm');
    $(this).css('position', 'absolute');
    $(this).css('margin', '1mm');

    let overlay = new Image();
    overlay.src = "http://via.placeholder.com/480x680/880000";
    $(overlay).css('position', 'absolute');
    $(this).before($(overlay));

//     console.log(normalizeUrl($(this).attr('src')));
//     GM_xmlhttpRequest({
//         method: "GET",
//         url: normalizeUrl($(this).attr('src')),
//         responseType: 'blob',
//         onload: function (response) {
//           processImage(response.response);
//         },
//         onerror: function (response) {
//             console.log(response);
//         }
//     });

//     throw new Error('Stop');

});

function processImage(imageData) {
  const imageUrl = URL.createObjectURL(imageData);
  $('#cards_main').prepend('<img id="testImg" />');
  $('#testImg').attr('src', imageUrl);
  let img = new Image();
  img.src = imageUrl;
  img.onload = function() {
    let canvas = document.createElement('canvas');
    if(canvas.getContext) {
      canvas.width = img.width;
      canvas.height = img.height;

      let ctx = canvas.getContext("2d");
      ctx.drawImage(img,0,0);

      img.getPixel = function(x, y) {
        let data = ctx.getImageData(x, y, 1, 1).data;
        return [data[0], data[1], data[2], data[3]];
      };
      console.log(img.getPixel(20,20));
    } else {
      // canvas not supported, fall back
      img.getPixel = function(x,y) {return [0,0,0,0];};
    }
  };
}

function normalizeUrl(url) {
  if (url.startsWith('//')) {
    return location.protocol + url;
  }
  return url;
}

})();