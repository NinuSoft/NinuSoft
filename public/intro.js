/**
 * NinuSoft — Instant Intro Screen Controller
 * Served as a static asset from /public/intro.js
 *
 * Three-stage dismiss system:
 *   Gate 1 (scanDone)     — scan animation completes
 *   Gate 2 (reactMounted) — React bundle loads and executes
 *   Gate 3 (reactReady)   — React finishes preloading critical images
 *
 * The overlay is only removed once ALL gates are open.
 */
(function () {
  'use strict';

  var intro = document.getElementById('ns-intro');
  var sessionBypass = (sessionStorage.getItem('intro_seen') === '1');

  /* ── Config ─────────────────────────────────────────────────────────── */
  var SCAN_MS = 1400;   // scan animation duration (ms)
  var FADE_MS = 650;    // CSS fade-out duration   (ms)

  /* ── DOM refs ───────────────────────────────────────────────────────── */
  var scan      = document.getElementById('ns-scan');
  var scanGlow  = document.getElementById('ns-scan-glow');
  var barFill   = document.getElementById('ns-bar-fill');
  var statusTxt = document.getElementById('ns-status-text');
  var dot       = document.getElementById('ns-dot');
  var logoWrap  = document.getElementById('ns-logo-wrap');

  /* ── State ──────────────────────────────────────────────────────────── */
  var started      = sessionBypass;
  var scanDone     = sessionBypass;   // gate 1 (pre-cleared if session bypass)
  var reactMounted = false;           // gate 2
  var reactReady   = false;           // gate 3

  var currentPct = sessionBypass ? 92 : 0; // pre-fill to 92% if seen before

  // If already seen, bypass the scanner animation but keep overlay visible to cover loading gap
  if (sessionBypass) {
    if (barFill) barFill.style.width = '92%';
    if (statusTxt) {
      statusTxt.textContent = 'Loading application\u2026';
      statusTxt.style.color = 'var(--dim)';
    }
    if (logoWrap) logoWrap.classList.add('ns-done');
    if (dot) dot.style.display = 'none';
  }

  /* ── updatePendingStatus ────────────────────────────────────────────── */
  function updatePendingStatus() {
    if (!scanDone) return;
    if (!reactMounted) {
      statusTxt.textContent = 'Loading application\u2026';
      statusTxt.style.color = 'var(--dim)';
      holdPulse();
    } else if (!reactReady) {
      statusTxt.textContent = 'Loading assets\u2026';
      statusTxt.style.color = 'var(--dim)';
      holdPulse();
    }
  }

  /* ── tryDismiss ─────────────────────────────────────────────────────── */
  var dismissing = false;
  function tryDismiss() {
    if (!scanDone || !reactMounted || !reactReady) {
      updatePendingStatus();
      return;
    }
    if (dismissing || !intro) return;
    dismissing = true;

    statusTxt.textContent = '\u2713\u00A0 Welcome to NinuSoft';
    statusTxt.style.color = 'var(--gold60)';

    // Quick animation to slide the progress bar to 100%
    var startVal = currentPct;
    var fillStartTime = performance.now();
    var fillDuration = 250; // 250ms to reach full

    function fillToFull(now) {
      var elapsed = now - fillStartTime;
      var progress = Math.min(elapsed / fillDuration, 1);
      var val = startVal + (100 - startVal) * progress;
      barFill.style.width = val.toFixed(2) + '%';

      if (progress < 1) {
        requestAnimationFrame(fillToFull);
      } else {
        // Once full, wait 200ms and fade out the overlay
        setTimeout(function () {
          sessionStorage.setItem('intro_seen', '1');
          intro.classList.add('ns-exit');
          document.body.classList.remove('ns-loading');
          document.body.removeAttribute('style');
          setTimeout(function () {
            if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
          }, FADE_MS + 100);
        }, 200);
      }
    }
    requestAnimationFrame(fillToFull);
  }

  /* ── React signals it has mounted ───────────────────────────────────── */
  window.__nsReactMounted = function () {
    reactMounted = true;
    tryDismiss();
  };

  /* ── React signals it has preloaded assets ──────────────────────────── */
  window.__nsReactReady = function () {
    reactMounted = true; // safety override
    reactReady = true;
    tryDismiss();
  };

  /* ── Pulsing/Creeping bar while waiting after scan completes ─────────── */
  var pulsing = false;
  function holdPulse() {
    if (pulsing) return;
    pulsing = true;

    function pulseCreep() {
      if (scanDone && !reactReady) {
        // Slowly creep towards 92% (ease-out style)
        if (currentPct < 92) {
          var remaining = 92 - currentPct;
          currentPct += remaining * 0.006;
          barFill.style.width = currentPct.toFixed(2) + '%';
        }
        requestAnimationFrame(pulseCreep);
      } else {
        pulsing = false;
      }
    }
    requestAnimationFrame(pulseCreep);
  }

  /* ── Main scan animation ─────────────────────────────────────────────── */
  function startScan() {
    if (started) return;
    started = true;

    statusTxt.textContent = 'Initializing\u2026';
    dot.className = 'ns-dot ns-dot-scan';
    scan.style.opacity = '1';

    var startTime = performance.now();

    function tick(now) {
      var elapsed  = now - startTime;
      var progress = Math.min(elapsed / SCAN_MS, 1);
      var pct      = (progress * 100).toFixed(2);

      /* Move scan line from 0% to 100% */
      scan.style.top = pct + '%';

      /* Update trailing glow gradient */
      var from = Math.max(0, progress * 100 - 22).toFixed(1);
      var mid  = Math.max(0, progress * 100 - 5).toFixed(1);
      scanGlow.style.background = [
        'linear-gradient(to bottom,',
        'transparent '          + from + '%,',
        'rgba(201,163,58,.12) ' + mid  + '%,',
        'rgba(201,163,58,.28) ' + pct  + '%,',
        'transparent '          + pct  + '%)'
      ].join(' ');
      scanGlow.style.opacity = '1';

      /* Progress bar fills up to 60% during the scan line animation */
      currentPct = progress * 60;
      barFill.style.width = currentPct.toFixed(2) + '%';

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      /* ── Scan complete ─────────────────────────────────────────────── */
      scan.style.opacity     = '0';
      scanGlow.style.opacity = '0';
      logoWrap.classList.add('ns-done');
      dot.style.display = 'none';
      scanDone = true;
      tryDismiss();
    }

    requestAnimationFrame(tick);
  }

  /* ── Start the scan animation immediately (if not bypassed) ─────────── */
  if (!sessionBypass) {
    startScan();
  }
})();
