package com.cdt.kitchenklock.weather

import zio.*
import zio.json.*
import java.util.Locale

private case class YrInstantDetails(
  air_temperature: Option[Double],
  wind_speed: Option[Double]
)
private case class YrInstant(details: YrInstantDetails)
private case class YrNext1hSummary(symbol_code: String)
private case class YrNext1h(summary: YrNext1hSummary)
private case class YrTimeSeriesData(
  instant: YrInstant,
  next_1_hours: Option[YrNext1h]
)
private case class YrTimeSeries(time: String, data: YrTimeSeriesData)
private case class YrProperties(timeseries: List[YrTimeSeries])
private case class YrResponse(properties: YrProperties)

private object YrInstantDetails:
  given JsonDecoder[YrInstantDetails] = DeriveJsonDecoder.gen[YrInstantDetails]
private object YrInstant:
  given JsonDecoder[YrInstant] = DeriveJsonDecoder.gen[YrInstant]
private object YrNext1hSummary:
  given JsonDecoder[YrNext1hSummary] = DeriveJsonDecoder.gen[YrNext1hSummary]
private object YrNext1h:
  given JsonDecoder[YrNext1h] = DeriveJsonDecoder.gen[YrNext1h]
private object YrTimeSeriesData:
  given JsonDecoder[YrTimeSeriesData] = DeriveJsonDecoder.gen[YrTimeSeriesData]
private object YrTimeSeries:
  given JsonDecoder[YrTimeSeries] = DeriveJsonDecoder.gen[YrTimeSeries]
private object YrProperties:
  given JsonDecoder[YrProperties] = DeriveJsonDecoder.gen[YrProperties]
private object YrResponse:
  given JsonDecoder[YrResponse] = DeriveJsonDecoder.gen[YrResponse]

object YrWeather:
  private val userAgent = "cdtKitchenKlock/1.0 github.com/cdt/cdtKitchenKlock"

  def fetch(lat: Double, lon: Double): Task[WeatherData] =
    val latStr = String.format(Locale.US, "%.4f", lat)
    val lonStr = String.format(Locale.US, "%.4f", lon)
    val url = s"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=$latStr&lon=$lonStr"
    SmhiWeather.httpGet(url, Map("User-Agent" -> userAgent)).flatMap { body =>
      ZIO.fromEither(body.fromJson[YrResponse])
        .mapError(e => new RuntimeException(s"YR parse error: $e"))
    }.flatMap { yr =>
      ZIO.fromOption(parseYr(yr))
        .orElseFail(new RuntimeException("No YR data available"))
    }

  private def parseYr(yr: YrResponse): Option[WeatherData] =
    val series = yr.properties.timeseries.sortBy(_.time)
    series.headOption.map { current =>
      val temp = current.data.instant.details.air_temperature.getOrElse(0.0)
      val wind = current.data.instant.details.wind_speed.getOrElse(0.0)
      val symbol = current.data.next_1_hours.map(_.summary.symbol_code).getOrElse("")
      val code = yrSymbolToCode(symbol)
      val forecastItems = series.drop(1).take(24).zipWithIndex
        .filter { case (_, i) => i % 3 == 0 }
        .map { case (ts, _) =>
          val t = ts.data.instant.details.air_temperature.getOrElse(0.0)
          val s = ts.data.next_1_hours.map(_.summary.symbol_code).getOrElse("")
          val c = yrSymbolToCode(s)
          ForecastItem(ts.time.take(16).replace("T", " "), t, c, weatherDescription(c))
        }
      WeatherData(temp, code, weatherDescription(code), wind, forecastItems)
    }

  private def yrSymbolToCode(symbol: String): Int =
    val s = symbol.stripSuffix("_day").stripSuffix("_night").stripSuffix("_polartwilight")
    s match
      case "clearsky"                                    => 1
      case "fair"                                        => 2
      case "partlycloudy"                                => 3
      case "cloudy"                                      => 6
      case "fog"                                         => 7
      case "lightrain" | "lightrainshowers"              => 18
      case "rain" | "rainshowers"                        => 19
      case "heavyrain" | "heavyrainshowers"              => 20
      case "thunder" | "rainshowersandthunder" |
           "lightrainshowersandthunder"                  => 21
      case "lightsleet" | "lightsleetshowers"            => 22
      case "sleet" | "sleetshowers"                      => 23
      case "heavysleet" | "heavysleetshowers"            => 24
      case "lightsnow" | "lightsnowshowers"              => 25
      case "snow" | "snowshowers"                        => 26
      case "heavysnow" | "heavysnowshowers"              => 27
      case _                                             => 3
