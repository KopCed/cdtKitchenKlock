package com.cdt.kitchenklock.weather

import zio.*
import com.cdt.kitchenklock.config.ConfigService
import java.time.Instant

object WeatherRouter:
  private type CacheKey = (String, Double, Double, String)

  private case class CachedWeather(data: WeatherData, fetchedAt: Instant)

  val live: ZLayer[ConfigService, Nothing, WeatherService] =
    ZLayer.fromZIO(
      for
        configSvc <- ZIO.service[ConfigService]
        cacheRef  <- Ref.make(Map.empty[CacheKey, CachedWeather])
      yield new WeatherService:
        override def fetch(lat: Double, lon: Double): Task[WeatherData] =
          for
            config <- configSvc.get
            key     = (config.weatherService, lat, lon, config.weatherApiKey)
            now    <- Clock.instant
            cached <- cacheRef.get
            result <- cached.get(key) match
              case Some(c)
                if java.time.Duration.between(c.fetchedAt, now).toMinutes < config.weatherRefreshMinutes =>
                ZIO.succeed(c.data)
              case _ =>
                for
                  data <- fetchFrom(config.weatherService, lat, lon, config.weatherApiKey)
                  _    <- cacheRef.set(Map(key -> CachedWeather(data, now)))
                yield data
          yield result
    )

  private def fetchFrom(service: String, lat: Double, lon: Double, apiKey: String): Task[WeatherData] =
    service match
      case "yr"          => YrWeather.fetch(lat, lon)
      case "accuweather" => AccuWeatherService.fetch(lat, lon, apiKey)
      case _             => SmhiWeather.fetch(lat, lon)
