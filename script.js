(() => {
  "use strict";

  const accessForm = document.querySelector("#access-form");
  const accessPassword = document.querySelector("#access-password");
  const accessError = document.querySelector("#access-error");
  const passwordHash = "0d563256b074dbd95ca18f4903b5ca0968ceeb8c0aa543f1a3b86895424bc84f";
  const sessionKey = "vak-demo-access";

  const hashText = async (text) => {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const grantAccess = () => {
    document.body.classList.remove("access-locked");
    document.body.classList.add("access-granted");
    sessionStorage.setItem(sessionKey, "granted");
  };

  if (sessionStorage.getItem(sessionKey) === "granted") {
    grantAccess();
  } else {
    requestAnimationFrame(() => accessPassword?.focus());
  }

  accessForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    accessError.textContent = "";

    const submittedHash = await hashText(accessPassword.value);
    if (submittedHash === passwordHash) {
      grantAccess();
      return;
    }

    accessPassword.value = "";
    accessPassword.focus();
    accessError.textContent = "パスワードが違います。もう一度入力してください。";
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateCount = (element, target) => {
    if (reducedMotion) {
      element.textContent = String(target);
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    const update = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const activateChart = (chart) => {
    if (chart.dataset.animated === "true") return;
    chart.dataset.animated = "true";

    chart.querySelectorAll("[data-value]").forEach((bar, index) => {
      const value = Number(bar.dataset.value);
      window.setTimeout(() => {
        bar.style.width = `${value}%`;
      }, reducedMotion ? 0 : index * 90);
    });

    chart.querySelectorAll("[data-count]").forEach((number, index) => {
      const value = Number(number.dataset.count);
      window.setTimeout(() => animateCount(number, value), reducedMotion ? 0 : index * 90);
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  const chartObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        activateChart(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  document.querySelectorAll("[data-chart]").forEach((chart) => chartObserver.observe(chart));

  // 印刷やPDF保存では、画面外の要素もすべて表示した状態にする。
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    document.querySelectorAll("[data-chart]").forEach((chart) => activateChart(chart));
  });
})();
