# page-loader.js
[![Maintainability](https://api.codeclimate.com/v1/badges/77144186f90fb7ce940f/maintainability)](https://codeclimate.com/github/brasid/project-lvl3-s382/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/77144186f90fb7ce940f/test_coverage)](https://codeclimate.com/github/brasid/project-lvl3-s382/test_coverage)
[![Build Status](https://travis-ci.com/brasid/project-lvl3-s382.svg?branch=master)](https://travis-ci.com/brasid/project-lvl3-s382)

##
This is a student's project provided by [hexlet](https://ru.hexlet.io). The main purpose of the project is to learn most common ways of work with asynchronous code.
This is a simple utility let you download page using provided url. It work's in similar way with browser page loaders.

Project mentor - [@Kirill Mokevnin](https://github.com/mokevnin).
##

## Installation
```sh
npm install -g brasid-page-loader
```
[![asciicast](https://asciinema.org/a/220295.svg)](https://asciinema.org/a/220295)

## Usage
The utility can download page to provided filepath.
```sh
page-loader -h

  Usage: page-loader [options] <address>

  Downloads page to your local machine with provided path

  Options:
    -V, --version        output the version number
    -o, --output [type]  Output path (default: current working directory)
    -h, --help           output usage information

```

## Download page with resources from address
```sh
page-loader http://site.org
```
[![asciicast](https://asciinema.org/a/220613.svg)](https://asciinema.org/a/220613)

## Debugging
To look at the pretty debug log just type:
```sh
DEBUG='page-loader*' page-loader http://site.org
```
