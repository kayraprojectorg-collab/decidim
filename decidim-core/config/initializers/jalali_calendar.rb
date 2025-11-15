# frozen_string_literal: true

# Jalali (Persian/Shamsi) Calendar Support
# This initializer patches I18n to support Jalali calendar for Persian locales

require "parsi-date"

module I18nJalaliExtension
  # Override I18n.localize to support Jalali calendar for Persian locales
  def localize(object, locale: nil, format: :default, **options)
    locale ||= I18n.locale
    return super unless object

    # Check if we should use Jalali calendar
    if should_use_jalali?(locale)
      localize_jalali(object, locale: locale, format: format, **options)
    else
      super
    end
  end
  alias l localize

  private

  def should_use_jalali?(locale)
    locale.to_s.start_with?("fa") || locale.to_s.start_with?("per")
  end

  def localize_jalali(object, locale: nil, format: :default, **options)
    # Convert to Date if it's a Time or DateTime
    date = object.is_a?(Date) ? object : object.to_date
    time_component = object.respond_to?(:hour) ? object : nil

    # Convert to Parsi::Date (Jalali)
    jalali_date = Parsi::Date.new(date.year, date.month, date.day)

    # Get format string from I18n
    scope = object.respond_to?(:sec) ? "time" : "date"
    format_key = "#{scope}.formats.#{format}"
    format_string = I18n.t(format_key, locale: locale, default: "%Y/%m/%d")

    # Format the Jalali date
    formatted = format_jalali_date(jalali_date, format_string, locale)

    # If original object had time component and format includes time
    if time_component && format_string.include?("%H")
      # Time was already included in the format string
      formatted.gsub!(/%H/, time_component.hour.to_s.rjust(2, "0"))
      formatted.gsub!(/%M/, time_component.min.to_s.rjust(2, "0"))
      formatted.gsub!(/%S/, time_component.sec.to_s.rjust(2, "0"))
    end

    formatted
  end

  def format_jalali_date(jalali_date, format_string, locale)
    year = jalali_date.year
    month = jalali_date.month
    day = jalali_date.day

    # Get Persian month and day names from I18n
    month_names = I18n.t("date.month_names", locale: locale, default: [])
    month_names_abbr = I18n.t("date.abbr_month_names", locale: locale, default: [])
    day_names = I18n.t("date.day_names", locale: locale, default: [])
    abbr_day_names = I18n.t("date.abbr_day_names", locale: locale, default: [])

    # Default Persian month names if not in I18n
    if month_names.empty?
      month_names = [
        nil,  # Index 0 (not used, months are 1-12)
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
      ]
    end

    # Default abbreviated month names
    if month_names_abbr.empty?
      month_names_abbr = [
        nil,
        "فرو",
        "ارد",
        "خرد",
        "تیر",
        "مرد",
        "شهر",
        "مهر",
        "آبا",
        "آذر",
        "دی",
        "بهم",
        "اسف"
      ]
    end

    # Default day names
    if day_names.empty?
      day_names = [
        "شنبه",
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنج‌شنبه",
        "جمعه"
      ]
    end

    if abbr_day_names.empty?
      abbr_day_names = day_names.map { |name| name[0..2] }
    end

    # Get day of week (convert from Gregorian)
    gregorian_date = Date.new(*jalali_date.to_gregorian)
    wday = (gregorian_date.wday + 1) % 7  # Adjust to Persian week (Saturday = 0)

    # Replace format codes
    result = format_string.dup
    result.gsub!(/%Y/, year.to_s.rjust(4, "0"))
    result.gsub!(/%y/, (year % 100).to_s.rjust(2, "0"))
    result.gsub!(/%m/, month.to_s.rjust(2, "0"))
    result.gsub!(/%_m/, month.to_s.rjust(2))
    result.gsub!(/%d/, day.to_s.rjust(2, "0"))
    result.gsub!(/%e/, day.to_s.rjust(2))
    result.gsub!(/%B/, month_names[month] || month.to_s)
    result.gsub!(/%b/, month_names_abbr[month] || month.to_s)
    result.gsub!(/%A/, day_names[wday] || "")
    result.gsub!(/%a/, abbr_day_names[wday] || "")

    result
  end
end

# Extend I18n module with Jalali support
I18n.singleton_class.prepend(I18nJalaliExtension)
