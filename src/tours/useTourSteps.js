import rawSteps from "./tour.steps.json";

export function buildTourSteps({ tour, formStore }) {
    return rawSteps.map((step) => {
        // STEP KHUSUS: settings
        function waitForElement(selector, { timeout = 5000, interval = 50 } = {}) {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const timer = setInterval(() => {
                    const el = document.querySelector(selector);
                    if (el) {
                        clearInterval(timer);
                        resolve(el);
                    } else if (Date.now() - start > timeout) {
                        clearInterval(timer);
                        reject(new Error(`Timeout waiting for ${selector}`));
                    }
                }, interval);
            });
        }

        if (step.meta?.type === "settings-step") {
            return {
                ...step,

                onHighlightStarted: () =>
                    document.body.classList.add("driver-active"),

                onDeselected: () =>
                    document.body.classList.remove("driver-active"),

                popover: {
                    ...step.popover,

                    onPopoverRender: (popover, { driver }) => {
                        const btn = document.querySelector("#btn-settings");
                        if (!btn) return;

                        btn.addEventListener(
                            "click",
                            async () => {
                                await waitForElement("#btn-edit-profile");
                                popover.nextButton.disabled = false;
                                driver.moveNext();
                            },
                            { once: true }
                        );
                    },
                },
            };
        }

        // STEP TERAKHIR
        if (step.meta?.type === "finish-step") {
            return {
                ...step,
                popover: {
                    ...step.popover,
                    showButtons: ["previous", "next", "close"],
                    onCloseClick: () => {
                        formStore.setFrontPageTourDone(true);
                        tour.destroy();
                    },
                    onNextClick: () => {
                        formStore.setFrontPageTourDone(true);
                        tour.destroy();
                    },
                },
            };
        }

        // STEP NORMAL
        return step;
    });
}
