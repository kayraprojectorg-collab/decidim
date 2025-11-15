/**
 * Persian/Farsi Numerals Converter
 * Converts English and Arabic numerals to Persian numerals
 */

const persianNumerals = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const englishNumerals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Convert English/Arabic numerals to Persian numerals
 * @param {string} str - String containing numerals
 * @returns {string} String with Persian numerals
 */
export const toPersianNumerals = (str) => {
  if (!str) return str;

  let result = str.toString();

  // Convert English numerals to Persian
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(englishNumerals[i], "g"), persianNumerals[i]);
  }

  // Convert Arabic numerals to Persian
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNumerals[i], "g"), persianNumerals[i]);
  }

  return result;
};

/**
 * Convert Persian numerals to English numerals
 * @param {string} str - String containing Persian numerals
 * @returns {string} String with English numerals
 */
export const toEnglishNumerals = (str) => {
  if (!str) return str;

  let result = str.toString();

  // Convert Persian numerals to English
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianNumerals[i], "g"), englishNumerals[i]);
  }

  // Convert Arabic numerals to English
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNumerals[i], "g"), englishNumerals[i]);
  }

  return result;
};

/**
 * Check if the current locale is RTL
 * @returns {boolean} True if RTL
 */
export const isRTL = () => {
  return document.documentElement.dir === "rtl";
};

/**
 * Check if the current locale is Persian/Farsi
 * @returns {boolean} True if Persian
 */
export const isPersian = () => {
  const html = document.documentElement;
  const lang = html.lang || html.getAttribute("lang");
  return lang && (lang.startsWith("fa") || lang.startsWith("per"));
};

/**
 * Convert all numbers in text nodes to Persian numerals
 * @param {HTMLElement} element - Root element to process
 */
export const convertNumbersToPersian = (element = document.body) => {
  if (!isRTL() && !isPersian()) return;

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script and style tags
        if (node.parentElement.tagName === "SCRIPT" ||
            node.parentElement.tagName === "STYLE") {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip inputs and textareas (they should be handled separately)
        if (node.parentElement.tagName === "INPUT" ||
            node.parentElement.tagName === "TEXTAREA") {
          return NodeFilter.FILTER_REJECT;
        }
        // Only accept if contains numbers
        if (/[0-9]/.test(node.nodeValue)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  nodes.forEach((node) => {
    node.nodeValue = toPersianNumerals(node.nodeValue);
  });
};

/**
 * Initialize Persian numerals conversion on page load and DOM changes
 */
export const initPersianNumerals = () => {
  if (!isRTL() && !isPersian()) return;

  // Convert on initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      convertNumbersToPersian();
    });
  } else {
    convertNumbersToPersian();
  }

  // Watch for dynamic content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          convertNumbersToPersian(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Handle input fields separately
  document.addEventListener("input", (e) => {
    const target = e.target;
    if (target.tagName === "INPUT" && target.type === "text") {
      const cursorPos = target.selectionStart;
      const oldLength = target.value.length;
      target.value = toPersianNumerals(target.value);
      const newLength = target.value.length;
      // Restore cursor position
      target.selectionStart = target.selectionEnd = cursorPos + (newLength - oldLength);
    }
  });
};

// Auto-initialize if RTL
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (isRTL() || isPersian()) {
      initPersianNumerals();
    }
  });
} else if (isRTL() || isPersian()) {
  initPersianNumerals();
}
