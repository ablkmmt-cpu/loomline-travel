(() => {
  const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const toIsoDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fromIsoDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  document.querySelectorAll("[data-date-control]").forEach((control) => {
    const input = control.querySelector('input[name="travel_date"]');
    const trigger = control.querySelector("[data-date-trigger]");
    const display = control.querySelector("[data-date-display]");
    const calendar = control.querySelector("[data-calendar]");
    const title = control.querySelector("[data-calendar-title]");
    const grid = control.querySelector("[data-calendar-grid]");
    const previousButton = control.querySelector("[data-calendar-prev]");
    const nextButton = control.querySelector("[data-calendar-next]");

    if (!input || !trigger || !display || !calendar || !title || !grid || !previousButton || !nextButton) return;

    const now = new Date();
    const minimumDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const initialDate = fromIsoDate(input.value);
    let visibleMonth = new Date(
      Date.UTC(
        (initialDate || minimumDate).getUTCFullYear(),
        (initialDate || minimumDate).getUTCMonth(),
        1,
      ),
    );

    input.min = toIsoDate(minimumDate);

    const renderValue = () => {
      const selectedDate = fromIsoDate(input.value);

      if (!selectedDate) {
        display.textContent = "Month / Day / Year";
        control.classList.remove("has-value");
        return;
      }

      display.textContent = fullDateFormatter.format(selectedDate);
      control.classList.add("has-value");
      control.classList.remove("is-invalid");
    };

    const renderCalendar = () => {
      const year = visibleMonth.getUTCFullYear();
      const month = visibleMonth.getUTCMonth();
      const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const selectedIso = input.value;
      const todayIso = toIsoDate(minimumDate);

      title.textContent = monthFormatter.format(visibleMonth);
      grid.replaceChildren();

      for (let index = 0; index < firstWeekday; index += 1) {
        const empty = document.createElement("span");
        empty.className = "form-calendar-empty";
        empty.setAttribute("aria-hidden", "true");
        grid.append(empty);
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(Date.UTC(year, month, day));
        const iso = toIsoDate(date);
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = String(day);
        button.dataset.date = iso;
        button.setAttribute("aria-label", fullDateFormatter.format(date));
        button.disabled = date < minimumDate;

        if (iso === todayIso) button.classList.add("is-today");
        if (iso === selectedIso) {
          button.classList.add("is-selected");
          button.setAttribute("aria-current", "date");
        }

        button.addEventListener("click", () => {
          input.value = iso;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          renderValue();
          closeCalendar();
          trigger.focus();
        });

        grid.append(button);
      }

      const atMinimumMonth =
        year === minimumDate.getUTCFullYear() && month === minimumDate.getUTCMonth();
      previousButton.disabled = atMinimumMonth;
    };

    const openCalendar = () => {
      const selectedDate = fromIsoDate(input.value);
      const reference = selectedDate || minimumDate;
      visibleMonth = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
      renderCalendar();
      calendar.hidden = false;
      control.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");

      window.requestAnimationFrame(() => {
        const selected = calendar.querySelector(".is-selected:not(:disabled)");
        const firstAvailable = calendar.querySelector(".form-calendar-grid button:not(:disabled)");
        (selected || firstAvailable)?.focus();
      });
    };

    function closeCalendar() {
      calendar.hidden = true;
      control.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", () => {
      if (calendar.hidden) {
        openCalendar();
      } else {
        closeCalendar();
      }
    });

    previousButton.addEventListener("click", () => {
      visibleMonth = new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() - 1, 1));
      renderCalendar();
    });

    nextButton.addEventListener("click", () => {
      visibleMonth = new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 1));
      renderCalendar();
    });

    grid.addEventListener("keydown", (event) => {
      const activeDay = event.target.closest("button[data-date]");
      if (!activeDay) return;

      const buttons = Array.from(grid.querySelectorAll("button[data-date]"));
      const currentIndex = buttons.indexOf(activeDay);
      const offsets = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      };
      const offset = offsets[event.key];

      if (!offset) return;

      event.preventDefault();
      const target = buttons[currentIndex + offset];
      if (target && !target.disabled) target.focus();
    });

    calendar.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCalendar();
        trigger.focus();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (!calendar.hidden && !control.contains(event.target)) closeCalendar();
    });

    input.addEventListener("invalid", (event) => {
      event.preventDefault();
      control.classList.add("is-invalid");
      openCalendar();
    });

    input.addEventListener("input", renderValue);
    input.addEventListener("change", renderValue);
    input.form?.addEventListener("reset", () => {
      window.requestAnimationFrame(() => {
        renderValue();
        closeCalendar();
      });
    });

    renderValue();
  });
})();
