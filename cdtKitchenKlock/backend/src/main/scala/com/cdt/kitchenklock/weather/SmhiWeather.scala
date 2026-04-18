package com.cdt.kitchenklock.weather

import zio.*
import zio.json.*
import java.net.URI
import java.net.http.{HttpClient, HttpRequest, HttpResponse}
import java.time.Duration as JDuration
import java.util.Locale

private case class SmhiParameter(name: String, values: List[Double])
private case class SmhiTimeSeries(validTime: String, parameters: List[SmhiParameter])
private case class SmhiResponse(timeSeries: List[SmhiTimeSeries])

private object SmhiParameter:
  given JsonDecoder[SmhiParameter] = DeriveJsonDecoder.gen[SmhiParameter]

private object SmhiTimeSeries:
  given JsonDecoder[SmhiTimeSeries] = DeriveJsonDecoder.gen[SmhiTimeSeries]

private object SmhiResponse:
  given JsonDecoder[SmhiResponse] = DeriveJsonDecoder.gen[SmhiResponse]

object SmhiWeather:
  def fetch(lat: Double, lon: Double): Task[WeatherData] =
    val latStr = String.format(Locale.US, "%.4f", lat)
    val lonStr = String.format(Locale.US, "%.4f", lon)
    val url = s"https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/$lonStr/lat/$latStr/data.json"
    httpGet(url, Map.empty).flatMap { body =>
      ZIO.fromEither(body.fromJson[SmhiResponse])
        .mapError(e => new RuntimeException(s"SMHI parse error: $e"))
    }.flatMap { smhi =>
      ZIO.fromOption(parseSmhi(smhi))
        .orElseFail(new RuntimeException("No SMHI data available"))
    }

  private def parseSmhi(smhi: SmhiResponse): Option[WeatherData] =
    val sorted = smhi.timeSeries.sortBy(_.validTime)
    sorted.headOption.map { current =>
      val temp = paramValue(current, "t").getOrElse(0.0)
      val wind = paramValue(current, "ws").getOrElse(0.0)
      val code = paramValue(current, "Wsymb2").map(_.toInt).getOrElse(0)
      val forecastItems = sorted.drop(1).take(24).zipWithIndex
        .filter { case (_, i) => i % 3 == 0 }
        .map { case (ts, _) =>
          val t = paramValue(ts, "t").getOrElse(0.0)
          val c = paramValue(ts, "Wsymb2").map(_.toInt).getOrElse(0)
          ForecastItem(ts.validTime.take(16).replace("T", " "), t, c, weatherDescription(c))
        }
      WeatherData(temp, code, weatherDescription(code), wind, forecastItems)
    }

  private def paramValue(ts: SmhiTimeSeries, name: String): Option[Double] =
    ts.parameters.find(_.name == name).flatMap(_.values.headOption)

  private val sharedClient: HttpClient = HttpClient.newBuilder()
    .connectTimeout(JDuration.ofSeconds(15))
    .build()

  private[weather] def httpGet(url: String, headers: Map[String, String]): Task[String] =
    ZIO.attemptBlocking {
      val builder = HttpRequest.newBuilder(URI.create(url)).GET()
        .timeout(JDuration.ofSeconds(30))
      headers.foreach { case (k, v) => builder.header(k, v) }
      val response = sharedClient.send(builder.build(), HttpResponse.BodyHandlers.ofString())
      if response.statusCode() / 100 != 2 then
        throw new RuntimeException(s"HTTP ${response.statusCode()} from $url")
      response.body()
    }
