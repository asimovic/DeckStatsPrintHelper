// ==UserScript==
// @name         Deck Stats Print Utility
// @version      0.2
// @description  Fix printing issues on deck stats
// @author       AlexS
// @match        https://deckstats.net/decks/*proxies=*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
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
  
})();