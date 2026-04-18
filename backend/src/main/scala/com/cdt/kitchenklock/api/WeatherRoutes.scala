package com.cdt.kitchenklock.api

import zio.*
import zio.http.*
import zio.json.*
import com.cdt.kitchenklock.config.ConfigService
import com.cdt.kitchenklock.weather.{WeatherService, WeatherData}

object WeatherRoutes:
  val routes: Routes[ConfigService & WeatherService, Nothing] = Routes(
    Method.GET / "api" / "weather" ->
      handler { (_: Request) =>
        for
          config <- ConfigService.get
          data   <- WeatherService.fetch(config.weatherLat, config.weatherLon)
                      .mapError(e => Response.internalServerError(e.getMessage))
        yield Response.json(data.toJson)
      }.merge,
  )
