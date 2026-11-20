/* Project Telly Studio: remote-first theme, app and layout editor. */
(function (global) {
    "use strict";
    var APL = global.APL = global.APL || {};
    var root = null, nav = null, page = "themes", selectedApp = null;
    var themes = [
        ["family", "Family Room", "Warm, welcoming and easy to read"],
        ["cinema", "Cinema", "Deep blacks and cinematic lighting"],
        ["minimal", "Minimal OLED", "Quiet, clean and distraction-free"],
        ["gamer", "Gaming", "Graphite with crisp cyan and violet"],
        ["champagne", "Champagne Signature", "Black glass with champagne edges"],
        ["frost", "Frost", "Icy glass, cool light and moving frost"],
        ["aurora", "Aurora", "Atmospheric green and violet light"],
        ["retro", "Retro Wave", "Soft synthwave colour and nostalgia"]
    ];
    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }
    function currentApps() {
        return (APL.allApps ? APL.allApps() : []).filter(function (a) { return !a.virtual && !a.folder; });
    }
    function visibleApps() {
        return currentApps().filter(function (a) { return APL.isAppVisible ? APL.isAppVisible(a.id) : true; });
    }
    function setTheme(key) {
        APL.sys.setPref("tellyPreset", key);
        if (APL.applyTellyPreset) APL.applyTellyPreset();
        render();
    }
    function applyVisuals() {
        var body = document.body;
        ["champagne", "ice", "clear"].forEach(function (x) { body.classList.remove("telly-glass-" + x); });
        ["flow", "aurora", "still"].forEach(function (x) { body.classList.remove("telly-bg-" + x); });
        ["slow", "normal", "fast"].forEach(function (x) { body.classList.remove("telly-motion-" + x); });
        ["subtle", "balanced", "vivid"].forEach(function (x) { body.classList.remove("telly-intensity-" + x); });
        body.classList.add("telly-glass-" + (APL.sys.pref("tellyGlassStyle") || "champagne"));
        body.classList.add("telly-bg-" + (APL.sys.pref("tellyAmbientStyle") || "flow"));
        body.classList.add("telly-motion-" + (APL.sys.pref("tellyMotionSpeed") || "normal"));
        body.classList.add("telly-intensity-" + (APL.sys.pref("tellyMotionIntensity") || "balanced"));
    }
    function setVisual(key, value) { APL.sys.setPref(key, value); applyVisuals(); render(); }
    function setLayout(key, value) {
        APL.sys.setPref(key, value);
        if (key === "appsPerRow" && APL.reloadApps) APL.reloadApps();
        document.body.classList.remove("telly-scale-compact", "telly-scale-large");
        var scale = APL.sys.pref("tellyTileScale") || "standard";
        if (scale !== "standard") document.body.classList.add("telly-scale-" + scale);
        document.body.classList.remove("telly-spacing-tight", "telly-spacing-balanced", "telly-spacing-relaxed");
        document.body.classList.add("telly-spacing-" + (APL.sys.pref("tellySpacing") || "balanced"));
        document.body.classList.toggle("telly-labels-on", APL.sys.pref("tellyLabels") !== "off");
        render();
    }
    function preview(panel) {
        var box = el("section", "telly-studio__preview");
        var top = el("div", "telly-studio__preview-head");
        top.appendChild(el("span", "", "LIVE PREVIEW"));
        top.appendChild(el("span", "telly-studio__preview-count", visibleApps().length + " apps selected"));
        box.appendChild(top);
        var strip = el("div", "telly-studio__preview-tiles");
        visibleApps().slice(0, 6).forEach(function (app) {
            var tile = el("div", "telly-studio__mock-tile");
            if (APL.makeTile) {
                var artwork = APL.makeTile(app, 0);
                artwork.classList.add("telly-studio__real-tile");
                tile.appendChild(artwork);
            } else { tile.textContent = app.name; }
            strip.appendChild(tile);
        });
        if (!strip.children.length) strip.appendChild(el("div", "telly-studio__empty", "Choose apps to build your home screen"));
        box.appendChild(strip);
        var desc = el("div", "telly-studio__preview-note", "Preview updates as you change your choices. Your real home screen uses the same saved settings.");
        box.appendChild(desc);
        panel.appendChild(box);
    }
    function addChoice(items, label, detail, active, run) {
        var b = el("div", "telly-studio__choice" + (active ? " is-active" : ""), label);
        b.appendChild(el("small", "", detail || (active ? "Selected" : "Press OK to select")));
        b._run = run;
        items.push(b);
    }
    function render() {
        if (!root) return;
        var panel = root.querySelector(".telly-studio__choices");
        var title = root.querySelector(".telly-studio__section-title");
        panel.innerHTML = "";
        var items = [];
        if (page === "themes") {
            title.textContent = "Choose your look";
            themes.forEach(function (t) {
                addChoice(items, t[1], t[2], (APL.sys.pref("tellyPreset") || "cinema") === t[0], function () { setTheme(t[0]); });
            });
        } else if (page === "apps") {
            title.textContent = "Choose and organise your apps";
            if (!selectedApp && currentApps().length) selectedApp = currentApps()[0].id;
            var selectedName = (currentApps().filter(function (a) { return a.id === selectedApp; })[0] || {}).name || "None";
            addChoice(items, "Move selected app earlier", "Selected: " + selectedName, false, function () {
                if (APL.moveApp && selectedApp) APL.moveApp(selectedApp, -1);
                render();
            });
            addChoice(items, "Move selected app later", "Selected: " + selectedName, false, function () {
                if (APL.moveApp && selectedApp) APL.moveApp(selectedApp, 1);
                render();
            });
            currentApps().forEach(function (app) {
                var shown = APL.isAppVisible ? APL.isAppVisible(app.id) : true;
                var choice = el("div", "telly-studio__choice" + (shown ? " is-active" : ""), app.name);
                choice.appendChild(el("small", "", shown ? "Shown on home screen · selected for organising" : "Hidden from home screen · press OK to show"));
                choice.dataset.appid = app.id;
                choice._run = function () {
                    if (app.id === "apl.settings" && shown) { APL.toast("Settings must remain available from your home screen."); return; }
                    if (APL.setAppVisibility) APL.setAppVisibility(app.id, !shown);
                    render();
                };
                items.push(choice);
            });
        } else if (page === "setup") {
            title.textContent = "Set up Project Telly";
            addChoice(items, "1 · Choose a theme", "Pick one of the eight visual presets", false, function () { page = "themes"; render(); });
            addChoice(items, "2 · Choose your apps", "Show only the apps you want on your home screen", false, function () { page = "apps"; render(); });
            addChoice(items, "3 · Arrange your layout", "Set tile size, spacing, app names and rows", false, function () { page = "layout"; render(); });
            addChoice(items, "4 · Set up the Home button", "Install Project Telly Remote, then enable its Accessibility service", false, function () {
                if (APL.sys.openAccessibilitySettings) APL.sys.openAccessibilitySettings();
                else APL.toast("On Android TV, open Settings → Accessibility → Project Telly Remote.");
            });
            addChoice(items, "Finish setup", "Your choices are saved automatically", false, function () {
                APL.sys.setPref("tellySetupComplete", true);
                closeStudio();
                APL.toast("Project Telly setup complete", true);
            });
        } else {
            title.textContent = "Shape your layout";
            [5, 6, 7].forEach(function (n) {
                addChoice(items, n + " apps per row", "Grid density", APL.sys.pref("appsPerRow") === n, function () { setLayout("appsPerRow", n); });
            });
            [["compact","Compact tiles"],["standard","Standard tiles"],["large","Large tiles"]].forEach(function (v) {
                addChoice(items, v[1], "Tile size", (APL.sys.pref("tellyTileScale") || "standard") === v[0], function () { setLayout("tellyTileScale", v[0]); });
            });
            [["on","Show app names"],["off","Hide app names"]].forEach(function (v) {
                addChoice(items, v[1], "App labels", (APL.sys.pref("tellyLabels") || "on") === v[0], function () { setLayout("tellyLabels", v[0]); });
            });
            [["tight","Tight spacing"],["balanced","Balanced spacing"],["relaxed","Relaxed spacing"]].forEach(function (v) {
                addChoice(items, v[1], "Tile spacing", (APL.sys.pref("tellySpacing") || "balanced") === v[0], function () { setLayout("tellySpacing", v[0]); });
            });
            [["champagne","Champagne Edge"],["ice","Frosted Ice"],["clear","Clear Glass"]].forEach(function (v) {
                addChoice(items, v[1], "Glass finish", (APL.sys.pref("tellyGlassStyle") || "champagne") === v[0], function () { setVisual("tellyGlassStyle", v[0]); });
            });
            [["flow","Ambient Flow"],["aurora","Aurora Motion"],["still","Static Background"]].forEach(function (v) {
                addChoice(items, v[1], "Background style", (APL.sys.pref("tellyAmbientStyle") || "flow") === v[0], function () { setVisual("tellyAmbientStyle", v[0]); });
            });
            [["slow","Slow Motion"],["normal","Normal Motion"],["fast","Fast Motion"]].forEach(function (v) {
                addChoice(items, v[1], "Animation speed", (APL.sys.pref("tellyMotionSpeed") || "normal") === v[0], function () { setVisual("tellyMotionSpeed", v[0]); });
            });
            [["subtle","Subtle"],["balanced","Balanced"],["vivid","Vivid"]].forEach(function (v) {
                addChoice(items, v[1], "Background intensity", (APL.sys.pref("tellyMotionIntensity") || "balanced") === v[0], function () { setVisual("tellyMotionIntensity", v[0]); });
            });            addChoice(items, "Reset all customisation", "Restore the default theme, app visibility and layout", false, function () {
                APL.sys.setPref("tellyPreset", "cinema");
                APL.sys.setPref("tellyGlassStyle", "champagne");
                APL.sys.setPref("tellyAmbientStyle", "flow");
                APL.sys.setPref("tellyMotionSpeed", "normal");
                APL.sys.setPref("tellyMotionIntensity", "balanced");
                APL.sys.setPref("tellyTileScale", "standard");
                APL.sys.setPref("tellyLabels", "on");
                APL.sys.setPref("tellySpacing", "balanced");
                APL.sys.setPref("appsPerRow", 6);
                APL.sys.setPref("hiddenApps", []);
                if (APL.resetHomeOrder) APL.resetHomeOrder();
                applyVisuals();
                if (APL.applyTellyPreset) APL.applyTellyPreset();
                if (APL.refreshHome) APL.refreshHome();
                render();
            });
        }
        items.forEach(function (item) {
            item.tabIndex = -1;
            panel.appendChild(item);
        });
        var tabs = [].slice.call(root.querySelectorAll("[data-page]"));
        tabs.forEach(function (tab) { tab.classList.toggle("is-active", tab.dataset.page === page); });
        var tiles = [root.querySelector(".telly-studio__close")].concat(tabs, items);
        if (nav) {
            nav.setTiles(tiles);
            nav.onFocus = function (i, item) { if (item && item.dataset && item.dataset.appid) selectedApp = item.dataset.appid; if (item && item.scrollIntoView) item.scrollIntoView({ block: "nearest" }); };
            var focusAt = 1;
            for (var i = 0; i < tiles.length; i++) if (tiles[i]._run && tiles[i].classList.contains("is-active")) { focusAt = i; break; }
            nav.focus(focusAt);
        }
        var pv = root.querySelector(".telly-studio__preview-wrap");
        pv.innerHTML = "";
        preview(pv);
    }
    function open() {
        if (root) { root.classList.add("is-open"); render(); if (nav) APL.pushNav(nav); return; }
        root = el("div", "telly-studio");
        var shell = el("div", "telly-studio__shell");
        var header = el("header", "telly-studio__header");
        var heading = el("div", "telly-studio__heading");
        heading.appendChild(el("span", "telly-studio__eyebrow", "PROJECT TELLY"));
        heading.appendChild(el("h1", "", "Personalise your TV"));
        heading.appendChild(el("p", "", "Make your home screen yours. Changes save automatically."));
        header.appendChild(heading);
        var close = el("div", "telly-studio__close", "BACK  ·  CLOSE");
        header.appendChild(close);
        shell.appendChild(header);
        var tabs = el("div", "telly-studio__tabs");
        [["setup","Start"],["themes","Themes"],["apps","My Apps"],["layout","Layout"]].forEach(function (v) {
            var tab = el("div", "telly-studio__tab", v[1]);
            tab.dataset.page = v[0];
            tabs.appendChild(tab);
        });
        shell.appendChild(tabs);
        var content = el("div", "telly-studio__content");
        var left = el("div", "telly-studio__left");
        left.appendChild(el("h2", "telly-studio__section-title", ""));
        left.appendChild(el("div", "telly-studio__choices"));
        content.appendChild(left);
        var right = el("div", "telly-studio__preview-wrap");
        content.appendChild(right);
        shell.appendChild(content);
        shell.appendChild(el("footer", "telly-studio__footer", "Use ▲ ▼ ◀ ▶ to navigate  ·  OK to select  ·  Back to close"));
        root.appendChild(shell);
        document.body.appendChild(root);
        close._close = true;
        var allFocus = [close].concat([].slice.call(tabs.children));
        nav = new APL.Nav({
            onSelect: function (i, item) {
                if (item._close) { closeStudio(); return; }
                if (item.dataset && item.dataset.page) { page = item.dataset.page; render(); return; }
                if (item._run) item._run();
            },
            onBack: closeStudio
        });
        root.classList.add("is-open");
        page = APL.sys.pref("tellySetupComplete") ? "themes" : "setup";
        render();
        APL.pushNav(nav);
        // Header close is an actual remote target, not a decorative control.
    }
    function closeStudio() {
        if (!root) return;
        root.classList.remove("is-open");
        if (nav) APL.popNav(nav);
        nav = null;
        if (APL.refreshHome) APL.refreshHome();
    }
    APL.tellyStudio = { open: open, close: closeStudio, isOpen: function () { return !!root && root.classList.contains("is-open"); } };
})(window);
