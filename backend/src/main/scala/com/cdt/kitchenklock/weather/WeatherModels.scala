package com.cdt.kitchenklock.weather

import zio.json.*

case class ForecastItem(
  time: String,
  temp: Double,
  code: Int,
  description: String
)

case class WeatherData(
  temperature: Double,
  weatherCode: Int,
  description: String,
  windSpeed: Double,
  forecast: List[ForecastItem]
)

object ForecastItem:
  given JsonDecoder[ForecastItem] = DeriveJsonDecoder.gen[ForecastItem]
  given JsonEncoder[ForecastItem] = DeriveJsonEncoder.gen[ForecastItem]

object WeatherData:
  given JsonDecoder[WeatherData] = DeriveJsonDecoder.gen[WeatherData]
  given JsonEncoder[WeatherData] = DeriveJsonEncoder.gen[WeatherData]

def weatherDescription(code: Int): String = code match
  case 1  => "Klart"
  case 2  => "Nästan klart"
  case 3  => "Halvklart"
  case 4  => "Halvmulet"
  case 5  => "Mulet"
  case 6  => "Mulet"
  case 7  => "Dimma"
  case 8  => "Lätt regnskur"
  case 9  => "Regnskur"
  case 10 => "Kraftig regnskur"
  case 11 => "Åskskur"
  case 12 => "Lätt snöblandad regnskur"
  case 13 => "Snöblandad regnskur"
  case 14 => "Kraftig snöblandad regnskur"
  case 15 => "Lätt snöskur"
  case 16 => "Snöskur"
  case 17 => "Kraftig snöskur"
  case 18 => "Lätt regn"
  case 19 => "Regn"
  case 20 => "Kraftigt regn"
  case 21 => "Åska"
  case 22 => "Lätt snöblandat regn"
  case 23 => "Snöblandat regn"
  case 24 => "Kraftigt snöblandat regn"
  case 25 => "Lätt snöfall"
  case 26 => "Snöfall"
  case 27 => "Kraftigt snöfall"
  case _  => "Okänt"
