(function () {
  "use strict";

  var copyToast;

  function showCopyToast() {
    if (!copyToast) {
      copyToast = document.createElement("div");
      copyToast.className = "copy-toast";
      copyToast.setAttribute("role", "status");
      copyToast.setAttribute("aria-live", "polite");
      copyToast.setAttribute("aria-atomic", "true");
      copyToast.innerHTML = '<span class="toast-check" aria-hidden="true"></span><span>Address copied</span>';
      document.body.appendChild(copyToast);
    }

    window.clearTimeout(copyToast.hideTimer);
    copyToast.classList.remove("is-visible");
    void copyToast.offsetWidth;
    copyToast.classList.add("is-visible");
    copyToast.hideTimer = window.setTimeout(function () {
      copyToast.classList.remove("is-visible");
    }, 1400);
  }

  document.querySelectorAll(".network-tabs input").forEach(function (input) {
    input.addEventListener("change", function () {
      var panel = input.closest(".panel");
      panel.querySelectorAll(".qr-pane").forEach(function (pane) {
        pane.classList.remove("active");
      });

      var selected = panel.querySelector(".qr-" + input.id);
      if (selected) selected.classList.add("active");
    });
  });

  document.addEventListener("keydown", function (event) {
    var modal = document.querySelector(".modal:target");
    if (event.key !== "Escape" || !modal) return;
    modal.classList.add("dismissed");
    history.replaceState(null, "", location.pathname + location.search);
  });

  window.addEventListener("hashchange", function () {
    var modal = document.getElementById(location.hash.slice(1));
    if (modal && modal.classList.contains("modal")) modal.classList.remove("dismissed");
  });

  document.querySelectorAll(".copy-address").forEach(function (addressButton) {
    var action = document.createElement("button");
    action.className = "copy-action";
    action.type = "button";
    action.setAttribute("data-address", addressButton.getAttribute("data-address"));
    action.setAttribute("aria-label", addressButton.getAttribute("aria-label"));
    action.setAttribute("data-default-label", addressButton.getAttribute("aria-label") || "Copy address");
    action.innerHTML = '<span class="copy-icon" aria-hidden="true"></span><span class="copy-label" role="status" aria-atomic="true">Copy</span>';
    addressButton.closest(".qr-pane").appendChild(action);
  });

  function fallbackCopy(address) {
    var field = document.createElement("textarea");
    field.value = address;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var successful = document.execCommand("copy");
    field.remove();
    return successful;
  }

  function showCopyStatus(button, successful) {
    var pane = button.closest(".qr-pane");
    var action = button.classList.contains("copy-action") ? button : pane.querySelector(".copy-action");
    var label = action.querySelector(".copy-label");
    window.clearTimeout(action.copyStatusTimer);
    action.classList.toggle("is-copied", successful);
    action.classList.toggle("copy-error", !successful);
    label.textContent = successful ? "Copied" : "Copy failed";
    action.setAttribute("aria-label", label.textContent);
    if (successful) showCopyToast();
    action.copyStatusTimer = window.setTimeout(function () {
      action.classList.remove("is-copied", "copy-error");
      label.textContent = "Copy";
      action.setAttribute("aria-label", action.getAttribute("data-default-label"));
    }, 1600);
  }

  document.querySelectorAll(".copy-address, .copy-action").forEach(function (button) {
    button.addEventListener("click", function () {
      var address = button.getAttribute("data-address");
      if (!address) return;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(address).then(
          function () { showCopyStatus(button, true); },
          function () { showCopyStatus(button, fallbackCopy(address)); }
        );
        return;
      }
      showCopyStatus(button, fallbackCopy(address));
    });
  });
})();
