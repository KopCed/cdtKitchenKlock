package com.cdt.kitchenklock.api

import zio.*
import zio.http.*

object VersionRoutes:

  private val startTime: String = _root_.java.lang.System.currentTimeMillis().toString

  val routes: Routes[Any, Nothing] = Routes(
    Method.GET / "api" / "version" ->
      handler { (_: Request) =>
        ZIO.succeed(Response(
          status  = Status.Ok,
          headers = Headers(Header.ContentType(MediaType.application.json)),
          body    = Body.fromString(s"""{"version":"$startTime"}"""),
        ))
      }
  )
