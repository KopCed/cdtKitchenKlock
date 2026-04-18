package com.cdt.kitchenklock

import zio.*
import zio.http.*
import com.cdt.kitchenklock.config.ConfigService
import com.cdt.kitchenklock.weather.WeatherRouter

object Main extends ZIOAppDefault:

  override def run: ZIO[Any, Any, Any] =
    val port = sys.env.get("PORT").flatMap(_.toIntOption).getOrElse(8080)

    ZIO.logInfo(s"Starting KitchenKlock on port $port") *>
      com.cdt.kitchenklock.api.LocalesRoutes.seedLocales *>
      zio.http.Server.serve(AppServer.routes)
        .provide(
          zio.http.Server.defaultWithPort(port),
          ConfigService.live,
          WeatherRouter.live,
        )
