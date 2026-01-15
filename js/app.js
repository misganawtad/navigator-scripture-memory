$(document).on("pagecreate", "#home", function () {
    var $langSelect = $("#lang-select");
    var $langBlocks = $(".lang-content");

    // --- 1. CORE LOADING LOGIC ---

    function loadPanelOnce(panelId) {
        var $panel = $(panelId);
        if (!$panel.length) return;
        if ($panel.data("loaded")) return;

        var src = $panel.attr("data-src");
        if (!src) return;

        $panel.load(src, function () {
            $panel.data("loaded", true);
            $panel.trigger("create");

            // After loading content, check if the "Current Verse" is in this panel
            restoreCheckboxState($panel);
            // Refresh the top display with fresh text from the loaded HTML
            updateTopDisplay();
        });
    }

    // --- 2. CURRENT VERSE DISPLAY LOGIC ---

    function updateTopDisplay() {
        var savedVerseId = localStorage.getItem("currentMemorizingVerse");
        var $display = $("#current-verse-display");
        var $displayText = $("#display-text");

        if (!savedVerseId) {
            $display.hide();
            return;
        }

        // Search for the checkbox in the active DOM
        var $checkbox = $('.current-verse-checkbox[data-verse-id="' + savedVerseId + '"]');

        if ($checkbox.length) {
            // Found the verse in a loaded panel: extract the latest text
            var $container = $checkbox.closest('[data-role="collapsible"]');
            
            // Clean up JQM header text
            var title = $container.find("h3").first().text()
                         .replace(/click to (collapse|expand) contents/gi, "").trim();
            var content = $container.find("p").first().text().trim();

            $displayText.html("<strong>" + title + "</strong><br>" + content);
            $display.show();

            // Cache the text so it persists if we switch to a different tab/language
            localStorage.setItem("cachedVerseText", title + "||" + content);
        } else {
            // Verse is not in current DOM (tab not loaded): use cached text
            var cached = localStorage.getItem("cachedVerseText");
            if (cached) {
                var parts = cached.split("||");
                $displayText.html("<strong>" + parts[0] + "</strong><br>" + parts[1]);
                $display.show();
            }
        }
    }

    function restoreCheckboxState($panel) {
        var savedVerseId = localStorage.getItem("currentMemorizingVerse");
        if (savedVerseId) {
            $panel.find('.current-verse-checkbox[data-verse-id="' + savedVerseId + '"]')
                  .prop("checked", true)
                  .checkboxradio("refresh");
        }
    }

    // Handle checkbox change (Global listener)
    $(document).on("change", ".current-verse-checkbox", function () {
        var $checkbox = $(this);
        if ($checkbox.is(":checked")) {
            // Ensure only one checkbox is active globally
            $(".current-verse-checkbox").not($checkbox).prop("checked", false).checkboxradio("refresh");
            localStorage.setItem("currentMemorizingVerse", $checkbox.attr("data-verse-id"));
        } else {
            localStorage.removeItem("currentMemorizingVerse");
            localStorage.removeItem("cachedVerseText");
        }
        updateTopDisplay();
    });

    // --- 3. COPY LOGIC ---

    $(document).on("click", ".copy-btn", function (e) {
        e.preventDefault();
        var $btn = $(this);
        var $container = $btn.closest('[data-role="collapsible"]');

        var title = $container.find("h3 a").contents().filter(function () {
            return this.nodeType === 3;
        }).text().trim();

        if (!title) {
            title = $container.find("h3").first().text()
                     .replace(/click to (collapse|expand) contents/gi, "").trim();
        }

        var content = $container.find("p").first().text().trim();
        var fullText = title + "\n" + content;

        navigator.clipboard.writeText(fullText).then(function () {
            var originalText = $btn.text();
            $btn.text("Copied!").addClass("ui-state-disabled");

            setTimeout(function () {
                $btn.text(originalText).removeClass("ui-state-disabled");
            }, 2000);
        });
    });

    // --- 4. LANGUAGE & NAVIGATION LOGIC ---

    function showLanguage(lang) {
        $langBlocks.hide();
        var $activeLang = $langBlocks.filter('[data-lang="' + lang + '"]').show();

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

    $(document).on("click", "[data-role='tabs'] .ui-navbar a", function () {
        var href = $(this).attr("href");
        loadPanelOnce(href);
    });

    // Initialize display on startup
    updateTopDisplay();
});
