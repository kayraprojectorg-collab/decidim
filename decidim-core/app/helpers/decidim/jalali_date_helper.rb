# frozen_string_literal: true

require "parsi-date"

module Decidim
  # Helper methods for formatting dates in Jalali (Persian/Shamsi) calendar
  module JalaliDateHelper
    # Check if current locale should use Jalali calendar
    def use_jalali_calendar?
      I18n.locale.to_s.start_with?("fa") || I18n.locale.to_s.start_with?("per")
    end

    # Localize a date or datetime object
    # If locale is Persian (fa*), converts to Jalali calendar
    # Otherwise uses standard Rails I18n.l
    #
    # @param object [Date, Time, DateTime] - Date/Time object to localize
    # @param format [Symbol] - Format symbol (e.g., :decidim_short)
    # @param options [Hash] - Additional options
    # @return [String] - Formatted date string
    def localize_date(object, format: :default, **options)
      return "" if object.nil?

      if use_jalali_calendar?
        localize_jalali(object, format: format, **options)
      else
        I18n.l(object, format: format, **options)
      end
    end
    alias l_date localize_date

    private

    # Convert Gregorian date to Jalali and format it
    def localize_jalali(object, format: :default, **options)
      # Convert to Date if it's a Time or DateTime
      date = object.is_a?(Date) ? object : object.to_date

      # Convert to Parsi::Date (Jalali)
      jalali_date = Parsi::Date.new(date.year, date.month, date.day)

      # Get format string from I18n
      format_string = I18n.t("date.formats.#{format}", default: "%Y/%m/%d")

      # Format the Jalali date
      formatted = format_jalali_date(jalali_date, format_string)

      # If original object had time component, append it
      if object.respond_to?(:hour) && format != :decidim_short_with_month_name_short
        time_format = I18n.t("time.formats.time_of_day", default: "%H:%M")
        time_str = object.strftime(time_format)
        formatted = "#{formatted} #{time_str}"
      end

      formatted
    end

    # Format a Jalali date according to a format string
    def format_jalali_date(jalali_date, format_string)
      year = jalali_date.year
      month = jalali_date.month
      day = jalali_date.day

      # Persian month names
      month_names = %w[
        فروردین
        اردیبهشت
        خرداد
        تیر
        مرداد
        شهریور
        مهر
        آبان
        آذر
        دی
        بهمن
        اسفند
      ]

      # Abbreviated month names
      month_names_abbr = %w[
        فرو
        ارد
        خرد
        تیر
        مرد
        شهر
        مهر
        آبا
        آذر
        دی
        بهم
        اسف
      ]

      # Persian day names (week starts on Saturday in Persian calendar)
      day_names = %w[
        شنبه
        یکشنبه
        دوشنبه
        سه‌شنبه
        چهارشنبه
        پنج‌شنبه
        جمعه
      ]

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
      result.gsub!(/%B/, month_names[month - 1])
      result.gsub!(/%b/, month_names_abbr[month - 1])
      result.gsub!(/%A/, day_names[wday])
      result.gsub!(/%a/, day_names[wday][0..2])  # First 3 chars

      result
    end
  end
end
