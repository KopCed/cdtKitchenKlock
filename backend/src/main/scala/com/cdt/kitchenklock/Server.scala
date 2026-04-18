package com.cdt.kitchenklock

import zio.*
import zio.http.*
import com.cdt.kitchenklock.api.{ConfigRoutes, DimRoutes, LocalesRoutes, VersionRoutes, WeatherRoutes}
import com.cdt.kitchenklock.config.ConfigService
import com.cdt.kitchenklock.weather.WeatherService

object AppServer:

  private val staticRoutes: Routes[Any, Nothing] = Routes(
    Method.GET / trailing ->
      handler { (path: Path, _: Request) =>
        val resourcePath = s"/public/${path.toString.stripPrefix("/")}"
        val cleanPath = if resourcePath == "/public/" || resourcePath == "/public" then "/public/index.html" else resourcePath

        ZIO.attempt {
          val stream = getClass.getResourceAsStream(cleanPath)
          if stream != null then
            try
              val bytes = stream.readAllBytes()
              val contentType = getContentType(cleanPath)
              val isHtml = cleanPath.endsWith(".html")
              val baseHeaders = Headers(Header.ContentType(MediaType.forContentType(contentType).getOrElse(MediaType.application.`octet-stream`)))
              val headers = if isHtml then baseHeaders ++ Headers(Header.Custom("Cache-Control", "no-cache, no-store, must-revalidate")) else baseHeaders
              Response(status = Status.Ok, headers = headers, body = Body.fromArray(bytes))
            finally
              stream.close()
          else
            val indexStream = getClass.getResourceAsStream("/public/index.html")
            if indexStream != null then
              try
                val bytes = indexStream.readAllBytes()
                Response(
                  status = Status.Ok,
                  headers = Headers(Header.ContentType(MediaType.text.html)) ++
                            Headers(Header.Custom("Cache-Control", "no-cache, no-store, must-revalidate")),
                  body = Body.fromArray(bytes)
                )
              finally
                indexStream.close()
            else
              Response.notFound
        }.orElseSucceed(Response.notFound)
      }
  )

  private def getContentType(path: String): String =
    if path.endsWith(".html") then "text/html; charset=utf-8"
    else if path.endsWith(".js") then "application/javascript"
    else if path.endsWith(".css") then "text/css"
    else if path.endsWith(".json") then "application/json"
    else if path.endsWith(".svg") then "image/svg+xml"
    else if path.endsWith(".png") then "image/png"
    else if path.endsWith(".ico") then "image/x-icon"
    else if path.endsWith(".ttf") then "font/ttf"
    else if path.endsWith(".otf") then "font/otf"
    else if path.endsWith(".woff2") then "font/woff2"
    else if path.endsWith(".woff") then "font/woff"
    else "application/octet-stream"

  val routes: Routes[ConfigService & WeatherService, Nothing] =
    ConfigRoutes.routes ++ WeatherRoutes.routes ++ DimRoutes.routes ++ LocalesRoutes.routes ++ VersionRoutes.routes ++ staticRoutes

