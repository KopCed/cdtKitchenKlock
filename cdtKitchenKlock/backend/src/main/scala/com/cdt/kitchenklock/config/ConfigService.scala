package com.cdt.kitchenklock.config

import zio.*
import zio.json.*
import java.io.{File, FileWriter, FileReader, BufferedReader}
import java.nio.file.{Files, Paths}

trait ConfigService:
  def get: UIO[AppConfig]
  def save(config: AppConfig): UIO[Unit]

object ConfigService:
  val configDir  = s"${_root_.java.lang.System.getProperty("user.home")}/.kitchenklock"
  val configFile = s"$configDir/config.json"

  def get: URIO[ConfigService, AppConfig] =
    ZIO.serviceWithZIO[ConfigService](_.get)

  def save(config: AppConfig): URIO[ConfigService, Unit] =
    ZIO.serviceWithZIO[ConfigService](_.save(config))

  private val allDigital = List("default", "led", "scifi", "flip", "globe")
  private val allAnalog  = List("classic", "pilot", "vintage", "cosmic")

  private def migrateJson(json: String): String =
    val step1 =
      if json.contains(""""backgroundStyle"""") then json
      else if json.contains(""""lavaLampBackground":true""") || json.contains(""""lavaLampBackground": true""") then
        json.lastIndexOf('}') match
          case -1 => json
          case i  => json.patch(i, ""","backgroundStyle":"lavaLamp"""", 0)
      else
        json.lastIndexOf('}') match
          case -1 => json
          case i  => json.patch(i, ""","backgroundStyle":"solid"""", 0)

    val step2 =
      if step1.contains(""""enabledClockStyles"""") then step1
      else
        def extractStr(j: String, key: String): Option[String] =
          val needle = s""""$key":""""
          val start  = j.indexOf(needle)
          if start < 0 then None
          else
            val vStart = start + needle.length
            val vEnd   = j.indexOf('"', vStart)
            if vEnd < 0 then None else Some(j.substring(vStart, vEnd))

        val clockMode    = extractStr(step1, "clockMode").getOrElse("digital")
        val digitalStyle = extractStr(step1, "digitalClockStyle").getOrElse("default")
        val analogStyle  = extractStr(step1, "analogClockStyle").getOrElse("classic")

        val digital =
          if digitalStyle == "random" then allDigital.map(s => s"digital-$s")
          else List(s"digital-$digitalStyle")
        val analog =
          if analogStyle == "random" then allAnalog.map(s => s"analog-$s")
          else List(s"analog-$analogStyle")
        val styles = clockMode match
          case "digital" => digital
          case "analog"  => analog
          case _         => digital ++ analog

        val stylesJson = styles.map(s => s""""$s"""").mkString("[", ",", "]")
        step1.lastIndexOf('}') match
          case -1 => step1
          case i  => step1.patch(i, s""","enabledClockStyles":$stylesJson""", 0)

    val migrations = Seq(
      "weatherApiKey"         -> "\"\"",
      "weatherRefreshMinutes" -> "30",
      "ledDimOpacity"         -> "5",
      "showWeatherTime"       -> "true",
      "weatherTimePosition"   -> "\"top-right\"",
      "language"              -> "\"sv\"",
      "timeFormat"            -> "\"24h\"",
      "dateFormat"            -> "\"YYYY-MM-DD\"",
      "temperatureUnit"       -> "\"celsius\"",
      "globeColor"            -> "\"purple\"",
      "starSize"              -> "1.5",
    )
    migrations.foldLeft(step2) { case (j, (key, defaultValue)) =>
      if j.contains(s""""$key"""") then j
      else j.lastIndexOf('}') match
        case -1 => j
        case i  => j.patch(i, s""","$key":$defaultValue""", 0)
    }

  val live: ULayer[ConfigService] = ZLayer.fromZIO(
    ZIO.attemptBlocking {
      val file = new File(configFile)
      if file.exists() then
        val source = scala.io.Source.fromFile(file)
        try
          val content = migrateJson(source.mkString)
          content.fromJson[AppConfig].getOrElse(AppConfig.default)
        finally
          source.close()
      else
        AppConfig.default
    }.orDie.flatMap { initialConfig =>
      Ref.make(initialConfig).map { configRef =>
        new ConfigService:
          override def get: UIO[AppConfig] = configRef.get

          override def save(config: AppConfig): UIO[Unit] =
            ZIO.attemptBlocking {
              val dir = new File(configDir)
              if !dir.exists() then dir.mkdirs()
              val writer = new FileWriter(configFile)
              try writer.write(config.toJson)
              finally writer.close()
            }.orDie *> configRef.set(config)
      }
    }
  )
