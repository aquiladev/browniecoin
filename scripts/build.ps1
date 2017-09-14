Param(
	[string]$task = "Build",
	[string]$configuration = "Release",
	[string]$appName = "browniecoin"
)

$ErrorActionPreference = 'Stop'

function Publish() {
	Write-Host "===== PUBLISHING FUNCTIONS====="
	$stopWatch = [System.Diagnostics.Stopwatch]::startNew()
	. $currentDir\kuduSiteUpload.ps1 -websiteName $appName -sourceDir $outFuncDir -websiteSlot $publishSlot
	Write-Host "===== PUBLISHED FUNCTIONS($($stopWatch.Elapsed.TotalMinutes)) ====="
}

if (!$appName) {
	throw "Application name not present."
}

$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path;
$projectDir = Split-Path $currentDir -Parent
$outFuncDir = "$projectDir\build"

& $task 