package com.cdt.kitchenklock.weather

import zio.*

trait WeatherService:
  def fetch(lat: Double, lon: Double): Task[WeatherData]

object WeatherService:
  def fetch(lat: Double, lon: Double): ZIO[WeatherService, Throwable, WeatherData] =
    ZIO.serviceWithZIO[WeatherService](_.fetch(lat, lon))
