$(document).on("pagecreate", "#home", function () {
  var $langSelect = $("#lang-select");
  var $langBlocks = $(".lang-content");

  function loadPanelOnce(panelId) {
    var $panel = $(panelId);
    if (!$panel.length) return;
    if ($panel.data("loaded")) return;

    var src = $panel.attr("data-src");
    if (!src) return;

    $panel.load(src, function () {
      $panel.data("loaded", true);
      $panel.trigger("create");
    });
  }

 // --- UPDATED COPY LOGIC ---
  $(document).on("click", ".copy-btn", function(e) {
    e.preventDefault();
    var $btn = $(this);
    var $container = $btn.closest('[data-role="collapsible"]');
    
    // We target the anchor tag inside H3 which JQM creates, 
    // and grab ONLY the first piece of text (the verse title)
    var title = $container.find("h3 a").contents().filter(function() {
      return this.nodeType === 3; // Filter for text nodes only
    }).text().trim();

    // If the above fails (depends on JQM version), this is a reliable fallback:
    if(!title) {
        title = $container.find("h3").first().text().replace(/click to (collapse|expand) contents/gi, "").trim();
    }

    var content = $container.find("p").first().text().trim();
    
    var fullText = title + "\n" + content;

    navigator.clipboard.writeText(fullText).then(function() {
      var originalText = $btn.text();
      $btn.text("Copied!").addClass("ui-state-disabled");
      
      setTimeout(function() {
        $btn.text(originalText).removeClass("ui-state-disabled");
      }, 2000);
    });
  });
  // --- end of copy logic ---

  function showLanguage(lang) {
    $langBlocks.hide();
    var $activeLang = $langBlocks.filter('[data-lang="' + lang + '"]').show();

    // load the active tab of that language
    var activeHref = $activeLang.find(".ui-navbar a.ui-btn-active").attr("href");
    if (activeHref) loadPanelOnce(activeHref);
  }

  var savedLang = localStorage.getItem("preferredLanguage") || "am";
  $langSelect.val(savedLang);
  showLanguage(savedLang);

  $langSelect.on("change", function () {
    var lang = $(this).val();
    localStorage.setItem("preferredLanguage", lang);
    showLanguage(lang);
  });

  // IMPORTANT: load when tab is clicked
  $(document).on("click", "[data-role='tabs'] .ui-navbar a", function () {
    var href = $(this).attr("href");
    loadPanelOnce(href);
  });
});
