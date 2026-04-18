package com.cdt.kitchenklock.api

import zio.*
import zio.http.*

object DimRoutes:
  val routes: Routes[Any, Nothing] = Routes(
    Method.POST / "api" / "dim" ->
      handler { (req: Request) =>
        req.url.queryParam("level").flatMap(_.toIntOption) match
          case None =>
            ZIO.succeed(Response.badRequest("Missing 'level' query parameter (0-100)"))
          case Some(level) if level < 0 || level > 100 =>
            ZIO.succeed(Response.badRequest("Level must be 0-100"))
          case Some(level) =>
            ZIO.attemptBlockingIO {
              val proc = new ProcessBuilder("/usr/bin/ddcutil", "setvcp", "10", level.toString)
                .redirectErrorStream(true)
                .start()
              val finished = proc.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)
              if !finished then
                proc.destroyForcibly()
                throw new RuntimeException("ddcutil timed out after 5 seconds")
              proc.exitValue()
            }.fold(
              err  => Response.internalServerError(s"ddcutil error: ${err.getMessage}"),
              code => if code == 0 then Response.ok
                      else Response.internalServerError(s"ddcutil exited with code $code")
            )
      },
  )
