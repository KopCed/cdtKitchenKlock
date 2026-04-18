package com.cdt.kitchenklock.weather

import zio.*
import zio.json.*
import java.util.Locale

private case class AwGeoPosition(Key: String)
private case class AwTemperatureValue(Value: Double)
private case class AwTemperatureMetric(Metric: AwTemperatureValue)
private case class AwCurrentCondition(
  Temperature: AwTemperatureMetric,
  WeatherIcon: Int,
  WeatherText: String,
  Wind: AwWind
)
private case class AwWind(Speed: AwWindSpeed)
private case class AwWindSpeed(Metric: AwTemperatureValue)

private case class AwHourlyItem(
  DateTime: String,
  Temperature: AwTemperatureValue,
  WeatherIcon: Int,
  IconPhrase: String
)

private object AwGeoPosition:
  given JsonDecoder[AwGeoPosition] = DeriveJsonDecoder.gen[AwGeoPosition]
private object AwTemperatureValue:
  given JsonDecoder[AwTemperatureValue] = DeriveJsonDecoder.gen[AwTemperatureValue]
private object AwTemperatureMetric:
  given JsonDecoder[AwTemperatureMetric] = DeriveJsonDecoder.gen[AwTemperatureMetric]
private object AwWindSpeed:
  given JsonDecoder[AwWindSpeed] = DeriveJsonDecoder.gen[AwWindSpeed]
private object AwWind:
  given JsonDecoder[AwWind] = DeriveJsonDecoder.gen[AwWind]
private object AwCurrentCondition:
  given JsonDecoder[AwCurrentCondition] = DeriveJsonDecoder.gen[AwCurrentCondition]
private object AwHourlyItem:
  given JsonDecoder[AwHourlyItem] = DeriveJsonDecoder.gen[AwHourlyItem]

object AccuWeatherService:
  private val base = "http://dataservice.accuweather.com"

  def fetch(lat: Double, lon: Double, apiKey: String): Task[WeatherData] =
    if apiKey.isBlank then
      ZIO.fail(new RuntimeException("AccuWeather API key is missing. Enter it in the configuration."))
    else
      for
        locationKey <- getLocationKey(lat, lon, apiKey)
        current     <- getCurrentConditions(locationKey, apiKey)
        forecast    <- getHourlyForecast(locationKey, apiKey)
      yield buildWeatherData(current, forecast)

  private def getLocationKey(lat: Double, lon: Double, apiKey: String): Task[String] =
    val latStr = String.format(Locale.US, "%.4f", lat)
    val lonStr = String.format(Locale.US, "%.4f", lon)
    val url = s"$base/locations/v1/cities/geoposition/search?apikey=$apiKey&q=$latStr,$lonStr"
    SmhiWeather.httpGet(url, Map.empty).flatMap { body =>
      ZIO.fromEither(body.fromJson[AwGeoPosition])
        .mapError(e => new RuntimeException(s"AccuWeather location parse error: $e"))
        .map(_.Key)
    }

  private def getCurrentConditions(locationKey: String, apiKey: String): Task[AwCurrentCondition] =
    val url = s"$base/currentconditions/v1/$locationKey?apikey=$apiKey&details=true&metric=true"
    SmhiWeather.httpGet(url, Map.empty).flatMap { body =>
      ZIO.fromEither(body.fromJson[List[AwCurrentCondition]])
        .mapError(e => new RuntimeException(s"AccuWeather conditions parse error: $e"))
        .flatMap(list => ZIO.fromOption(list.headOption)
          .orElseFail(new RuntimeException("AccuWeather returned empty conditions")))
    }

  private def getHourlyForecast(locationKey: String, apiKey: String): Task[List[AwHourlyItem]] =
    val url = s"$base/forecasts/v1/hourly/12hour/$locationKey?apikey=$apiKey&metric=true"
    SmhiWeather.httpGet(url, Map.empty).flatMap { body =>
      ZIO.fromEither(body.fromJson[List[AwHourlyItem]])
        .mapError(e => new RuntimeException(s"AccuWeather forecast parse error: $e"))
    }

  private def buildWeatherData(current: AwCurrentCondition, forecast: List[AwHourlyItem]): WeatherData =
    val code = awIconToCode(current.WeatherIcon)
    val forecastItems = forecast.zipWithIndex
      .filter { case (_, i) => i % 3 == 0 }
      .map { case (item, _) =>
        val c = awIconToCode(item.WeatherIcon)
        ForecastItem(item.DateTime.take(16).replace("T", " "), item.Temperature.Value, c, weatherDescription(c))
      }
    WeatherData(
      temperature = current.Temperature.Metric.Value,
      weatherCode = code,
      description = current.WeatherText,
      windSpeed   = current.Wind.Speed.Metric.Value / 3.6,
      forecast    = forecastItems
    )

  private def awIconToCode(icon: Int): Int = icon match
    case 1 | 2                     => 1
    case 3 | 4                     => 2
    case 5 | 6 | 7                 => 3
    case 8                         => 5
    case 11                        => 7
    case 12 | 13 | 14              => 18
    case 15 | 16 | 17              => 21
    case 18                        => 19
    case 19 | 20 | 21 | 22 | 23   => 22
    case 24                        => 22
    case 25                        => 26
    case 26                        => 26
    case 29                        => 23
    case 30                        => 3
    case 31                        => 3
    case 32                        => 3
    case 33 | 34                   => 1
    case 35 | 36 | 37 | 38        => 3
    case 39 | 40                   => 18
    case 41 | 42                   => 21
    case 43 | 44                   => 25
    case _                         => 3
