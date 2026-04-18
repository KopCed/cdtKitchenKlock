package com.cdt.kitchenklock.api

import zio.*
import zio.http.*
import zio.json.*
import com.cdt.kitchenklock.config.{AppConfig, ConfigService}

object ConfigRoutes:
  val routes: Routes[ConfigService, Nothing] = Routes(
    Method.GET / "api" / "config" ->
      handler { (_: Request) =>
        ConfigService.get.map(config => Response.json(config.toJson))
      },

    Method.PUT / "api" / "config" ->
      handler { (req: Request) =>
        req.body.asString.flatMap { body =>
          body.fromJson[AppConfig] match
            case Left(err)     =>
              ZIO.succeed(Response.badRequest(s"Bad request: $err"))
            case Right(config) =>
              ConfigService.save(config).as(Response.json(config.toJson))
        }.catchAll { e =>
          ZIO.succeed(Response.internalServerError(e.getMessage))
        }
      },
  )
