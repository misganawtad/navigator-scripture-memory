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

  // --- ADD THIS COPY LOGIC START ---
  $(document).on("click", ".copy-btn", function(e) {
    e.preventDefault();
    var $btn = $(this);
    var $container = $btn.closest('[data-role="collapsible"]');
    
    // Find the H3 (ignoring the jQuery Mobile collapse icon text if present)
    var title = $container.find("h3").first().text().trim();
    var content = $container.find("p").first().text().trim();
    
    var fullText = title + "\n" + content;

    navigator.clipboard.writeText(fullText).then(function() {
      // Visual feedback
      var originalText = $btn.text();
      $btn.text("Copied!").addClass("ui-state-disabled");
      
      setTimeout(function() {
        $btn.text(originalText).removeClass("ui-state-disabled");
      }, 2000);
    });
  });
  // --- ADD THIS COPY LOGIC END ---

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
