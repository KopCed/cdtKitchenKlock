ThisBuild / organization := "com.cdt"
ThisBuild / version      := "1.0.0"
ThisBuild / scalaVersion := "3.6.3"

lazy val root = (project in file("."))
  .settings(
    name := "kitchenklock",
    libraryDependencies ++= Seq(
      "dev.zio" %% "zio"        % "2.1.14",
      "dev.zio" %% "zio-http"   % "3.0.1",
      "dev.zio" %% "zio-json"   % "0.7.3",
      "dev.zio" %% "zio-cache"  % "0.2.4",
    ),
    assembly / assemblyJarName := "kitchenklock-assembly.jar",
    assembly / assemblyMergeStrategy := {
      case PathList("META-INF", "services", xs @ _*)       => MergeStrategy.concat
      case PathList("META-INF", xs @ _*)                   => MergeStrategy.discard
      case PathList("reference.conf")                      => MergeStrategy.concat
      case PathList("application.conf")                    => MergeStrategy.concat
      case "module-info.class"                             => MergeStrategy.discard
      case x if x.endsWith(".class")                      => MergeStrategy.last
      case x =>
        val oldStrategy = (assembly / assemblyMergeStrategy).value
        oldStrategy(x)
    },
    Compile / mainClass := Some("com.cdt.kitchenklock.Main"),
    assembly / mainClass := Some("com.cdt.kitchenklock.Main"),
    scalacOptions ++= Seq("-deprecation", "-feature", "-Xmax-inlines", "64"),
  )
