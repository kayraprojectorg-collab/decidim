// Jalali (Persian/Shamsi) calendar conversion utilities
import jalaali from "jalaali-js";

/**
 * Convert Gregorian date to Jalali
 * @param {Date} gregorianDate - JavaScript Date object
 * @returns {Object} - {jy: year, jm: month, jd: day}
 */
export const gregorianToJalali = (gregorianDate) => {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1;
  const day = gregorianDate.getDate();

  return jalaali.toJalaali(year, month, day);
};

/**
 * Convert Jalali date to Gregorian
 * @param {number} jy - Jalali year
 * @param {number} jm - Jalali month (1-12)
 * @param {number} jd - Jalali day
 * @returns {Date} - JavaScript Date object
 */
export const jalaliToGregorian = (jy, jm, jd) => {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
};

/**
 * Format Jalali date as string
 * @param {number} jy - Jalali year
 * @param {number} jm - Jalali month
 * @param {number} jd - Jalali day
 * @param {string} separator - Date separator (default: "/")
 * @param {string} order - Date order (default: "y-m-d")
 * @returns {string} - Formatted date string
 */
export const formatJalaliDate = (jy, jm, jd, separator = "/", order = "y-m-d") => {
  const year = jy.toString();
  const month = jm < 10 ? `0${jm}` : jm.toString();
  const day = jd < 10 ? `0${jd}` : jd.toString();

  if (order === "d-m-y") {
    return `${day}${separator}${month}${separator}${year}`;
  } else if (order === "m-d-y") {
    return `${month}${separator}${day}${separator}${year}`;
  }
  // Default: y-m-d
  return `${year}${separator}${month}${separator}${day}`;
};

/**
 * Parse Jalali date string to components
 * @param {string} dateString - Jalali date string
 * @param {string} separator - Date separator
 * @param {string} order - Date order
 * @returns {Object} - {jy: year, jm: month, jd: day}
 */
export const parseJalaliDate = (dateString, separator = "/", order = "y-m-d") => {
  const parts = dateString.split(separator).map(p => parseInt(p, 10));

  if (order === "d-m-y") {
    return { jd: parts[0], jm: parts[1], jy: parts[2] };
  } else if (order === "m-d-y") {
    return { jm: parts[0], jd: parts[1], jy: parts[2] };
  }
  // Default: y-m-d
  return { jy: parts[0], jm: parts[1], jd: parts[2] };
};

/**
 * Convert ISO date string (YYYY-MM-DD) to Jalali display format
 * @param {string} isoDate - ISO format date string
 * @param {Object} formats - Format configuration {order, separator}
 * @returns {string} - Jalali formatted date
 */
export const isoToJalaliDisplay = (isoDate, formats) => {
  const [year, month, day] = isoDate.split("-").map(p => parseInt(p, 10));
  const jalali = jalaali.toJalaali(year, month, day);
  return formatJalaliDate(jalali.jy, jalali.jm, jalali.jd, formats.separator, formats.order);
};

/**
 * Convert Jalali display format to ISO date string (YYYY-MM-DD)
 * @param {string} jalaliDate - Jalali formatted date string
 * @param {Object} formats - Format configuration {order, separator}
 * @returns {string} - ISO format date
 */
export const jalaliDisplayToISO = (jalaliDate, formats) => {
  const { jy, jm, jd } = parseJalaliDate(jalaliDate, formats.separator, formats.order);
  const gregorian = jalaali.toGregorian(jy, jm, jd);

  const year = gregorian.gy.toString();
  const month = gregorian.gm < 10 ? `0${gregorian.gm}` : gregorian.gm.toString();
  const day = gregorian.gd < 10 ? `0${gregorian.gd}` : gregorian.gd.toString();

  return `${year}-${month}-${day}`;
};

/**
 * Get Jalali month names in Persian
 * @returns {Array} - Array of month names
 */
export const getJalaliMonthNames = () => {
  return [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند"
  ];
};

/**
 * Get Jalali day names in Persian
 * @returns {Array} - Array of day names (starting from Saturday)
 */
export const getJalaliDayNames = () => {
  return [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه"
  ];
};

/**
 * Check if a locale should use Jalali calendar
 * @param {string} locale - Locale code (e.g., "fa", "fa-IR")
 * @returns {boolean} - True if locale should use Jalali
 */
export const shouldUseJalali = (locale) => {
  return locale && (locale.startsWith("fa") || locale.startsWith("per"));
};
