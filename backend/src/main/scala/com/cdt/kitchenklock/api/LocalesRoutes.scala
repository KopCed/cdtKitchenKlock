package com.cdt.kitchenklock.api

import zio.*
import zio.http.*
import zio.json.*
import java.io.File
import java.nio.file.{Files, StandardCopyOption}

object LocalesRoutes:

  private val localesDir =
    s"${_root_.java.lang.System.getProperty("user.home")}/.kitchenklock/locales"

  val seedLocales: UIO[Unit] = ZIO.attemptBlocking {
    val dir = new File(localesDir)
    if !dir.exists() then dir.mkdirs()

    for lang <- Seq("sv", "en") do
      val target = new File(s"$localesDir/$lang.json")
      val stream = getClass.getResourceAsStream(s"/locales/$lang.json")
      if stream != null then
        try Files.copy(stream, target.toPath, StandardCopyOption.REPLACE_EXISTING)
        finally stream.close()
  }.orDie

  val routes: Routes[Any, Nothing] = Routes(

    Method.GET / "api" / "locales" ->
      handler { (_: Request) =>
        ZIO.attemptBlocking {
          val dir = new File(localesDir)
          val langs: List[String] =
            if dir.exists() then
              Option(dir.listFiles())
                .getOrElse(Array.empty[File])
                .collect { case f if f.isFile && f.getName.endsWith(".json") =>
                  f.getName.stripSuffix(".json")
                }
                .sorted
                .toList
            else List("sv")
          langs.toJson
        }.orElseSucceed("""["sv"]""")
          .map(json =>
            Response(
              status  = Status.Ok,
              headers = Headers(Header.ContentType(MediaType.application.json)),
              body    = Body.fromString(json),
            )
          )
      },

    Method.GET / "api" / "locales" / string("lang") ->
      handler { (lang: String, _: Request) =>
        if !lang.matches("[a-zA-Z0-9_-]+") then
          ZIO.succeed(Response.status(Status.BadRequest))
        else
          ZIO.attemptBlocking {
            val file = new File(s"$localesDir/$lang.json")
            if file.exists() && file.isFile then
              val content = new String(Files.readAllBytes(file.toPath), "UTF-8")
              Response(
                status  = Status.Ok,
                headers = Headers(Header.ContentType(MediaType.application.json)),
                body    = Body.fromString(content),
              )
            else
              Response.notFound
          }.orElseSucceed(Response.notFound)
      },
  )
